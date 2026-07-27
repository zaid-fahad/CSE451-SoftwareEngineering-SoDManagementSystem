import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.model.user import User
from app.model.duty import Duty

@pytest.mark.asyncio
async def test_duty_management_lifecycle_and_conflict_prevention(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register a student user (using unique values to avoid test interference)
        reg_stud = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Duty Student",
                "email": "dutystud_unique_life@iub.edu.bd",
                "department_id": "22-98765-2",
                "password": "password"
            }
        )
        assert reg_stud.status_code == 201
        stud_id = reg_stud.json()["id"]

        # 2. Login student to upload a class schedule
        login_stud = await ac.post(
            "/api/v1/auth/login",
            json={"email": "dutystud_unique_life@iub.edu.bd", "password": "password"}
        )
        stud_token = login_stud.json()["access_token"]
        stud_headers = {"Authorization": f"Bearer {stud_token}"}

        # Student has class on Mondays 09:00 - 11:00
        parse_response = await ac.post(
            "/api/v1/schedule/parse",
            headers=stud_headers,
            json={"raw_text": "PHY101 - MON - 09:00-11:00"}
        )
        assert parse_response.status_code == 200

        # 3. Register a manager user
        reg_mgr = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Duty Manager",
                "email": "dutymgr_unique_life@iub.edu.bd",
                "department_id": "22-87654-2",
                "password": "password"
            }
        )
        assert reg_mgr.status_code == 201
        
        # Override the manager user's role directly in the test database session
        db_mgr_result = await db.execute(select(User).where(User.email == "dutymgr_unique_life@iub.edu.bd"))
        db_mgr = db_mgr_result.scalars().first()
        db_mgr.role = "LabManager"
        await db.commit()

        # Login manager
        login_mgr = await ac.post(
            "/api/v1/auth/login",
            json={"email": "dutymgr_unique_life@iub.edu.bd", "password": "password"}
        )
        mgr_token = login_mgr.json()["access_token"]
        mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

        # 4. Try to create a duty slot for the student at a CONFLICTING time (Monday 10:00 - 12:00)
        # It overlaps on Monday 10:00 - 11:00 (PHY101 is Mon 09:00-11:00)
        conflict_response = await ac.post(
            "/api/v1/tasks",
            headers=mgr_headers,
            json={
                "title": "Conflicting Lab Duty",
                "date": "2026-07-27",  # This is a Monday
                "start_time": "10:00",
                "end_time": "12:00",
                "assigned_student_id": stud_id,
                "notes": "Testing conflicts"
            }
        )
        assert conflict_response.status_code == 409
        assert conflict_response.json()["detail"]["code"] == "CONFLICT_DETECTED"
        assert conflict_response.json()["detail"]["detail"]["course"] == "PHY101"

        # 5. Create a duty slot for the student at a NON-CONFLICTING time (Monday 12:00 - 14:00)
        success_response = await ac.post(
            "/api/v1/tasks",
            headers=mgr_headers,
            json={
                "title": "Valid Lab Duty",
                "date": "2026-07-27",  # Monday
                "start_time": "12:00",
                "end_time": "14:00",
                "assigned_student_id": stud_id,
                "notes": "Testing success"
            }
        )
        assert success_response.status_code == 201
        duty_id = success_response.json()["id"]

        # 6. Student views their assigned tasks
        list_stud_response = await ac.get("/api/v1/tasks", headers=stud_headers)
        assert list_stud_response.status_code == 200
        stud_duties = list_stud_response.json()
        assert len(stud_duties) == 1
        assert stud_duties[0]["title"] == "Valid Lab Duty"

        # 7. Student marks their assigned task as Completed
        complete_response = await ac.patch(
            f"/api/v1/tasks/{duty_id}",
            headers=stud_headers,
            json={"status": "Completed", "notes": "Completed duty successfully."}
        )
        assert complete_response.status_code == 200
        assert complete_response.json()["status"] == "Completed"

        # 8. Manager deletes the duty slot
        delete_response = await ac.delete(f"/api/v1/tasks/{duty_id}", headers=mgr_headers)
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Duty slot deleted."

@pytest.mark.asyncio
async def test_non_manager_cannot_create_duty():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register and login student
        await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Regular Student",
                "email": "regularstud_unique_life@iub.edu.bd",
                "department_id": "22-76543-2",
                "password": "password"
            }
        )
        login_stud = await ac.post(
            "/api/v1/auth/login",
            json={"email": "regularstud_unique_life@iub.edu.bd", "password": "password"}
        )
        token = login_stud.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Try to create duty
        response = await ac.post(
            "/api/v1/tasks",
            headers=headers,
            json={
                "title": "Hack Attempt Lab Duty",
                "date": "2026-07-27",
                "start_time": "12:00",
                "end_time": "14:00",
                "assigned_student_id": 1,
                "notes": "Should fail"
            }
        )
        assert response.status_code == 403
