import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.model.user import User
from app.model.duty import Duty
from app.model.swap import Swap
from app.model.notification import Notification

@pytest.mark.asyncio
async def test_swap_request_and_broadcast_lifecycle(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register 3 students:
        # - Student A: assigned to a duty, requests swap
        # - Student B: eligible, should receive broadcast
        # - Student C: busy (class scheduled), should NOT receive broadcast
        
        # Student A
        reg_a = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Student A",
                "email": "studenta@iub.edu.bd",
                "department_id": "22-99001-2",
                "password": "password"
            }
        )
        assert reg_a.status_code == 201
        id_a = reg_a.json()["id"]

        # Student B
        reg_b = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Student B",
                "email": "studentb@iub.edu.bd",
                "department_id": "22-99002-2",
                "password": "password"
            }
        )
        assert reg_b.status_code == 201
        id_b = reg_b.json()["id"]

        # Student C
        reg_c = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Student C",
                "email": "studentc@iub.edu.bd",
                "department_id": "22-99003-2",
                "password": "password"
            }
        )
        assert reg_c.status_code == 201
        id_c = reg_c.json()["id"]

        # 2. Login Student C to upload conflicting schedule: Monday 09:00 - 11:00 class
        login_c = await ac.post(
            "/api/v1/auth/login",
            json={"email": "studentc@iub.edu.bd", "password": "password"}
        )
        token_c = login_c.json()["access_token"]
        headers_c = {"Authorization": f"Bearer {token_c}"}
        await ac.post(
            "/api/v1/schedule/parse",
            headers=headers_c,
            json={"raw_text": "PHY101 - MON - 09:00-11:00"}
        )

        # 3. Register a Manager to assign a duty to Student A
        reg_mgr = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Manager Bob",
                "email": "managerbob@iub.edu.bd",
                "department_id": "22-99004-2",
                "password": "password"
            }
        )
        # Make Manager Bob a manager
        db_mgr_res = await db.execute(select(User).where(User.email == "managerbob@iub.edu.bd"))
        db_mgr = db_mgr_res.scalars().first()
        db_mgr.role = "LabManager"
        await db.commit()

        # Login manager
        login_mgr = await ac.post(
            "/api/v1/auth/login",
            json={"email": "managerbob@iub.edu.bd", "password": "password"}
        )
        token_mgr = login_mgr.json()["access_token"]
        headers_mgr = {"Authorization": f"Bearer {token_mgr}"}

        # Create duty on Monday 09:00 - 11:00 and assign to Student A
        duty_response = await ac.post(
            "/api/v1/tasks",
            headers=headers_mgr,
            json={
                "title": "SE Lab Duty",
                "date": "2026-07-27",  # Monday
                "start_time": "09:00",
                "end_time": "11:00",
                "assigned_student_id": id_a,
                "notes": "Original shift"
            }
        )
        assert duty_response.status_code == 201
        duty_id = duty_response.json()["id"]

        # 4. Student A requests a Public Broadcast Swap
        login_a = await ac.post(
            "/api/v1/auth/login",
            json={"email": "studenta@iub.edu.bd", "password": "password"}
        )
        token_a = login_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        swap_response = await ac.post(
            "/api/v1/swaps/request",
            headers=headers_a,
            json={
                "duty_id": duty_id,
                "reason": "Family emergency"
            }
        )
        assert swap_response.status_code == 201
        swap_id = swap_response.json()["id"]
        assert swap_response.json()["target_student_id"] is None
        assert swap_response.json()["status"] == "Pending"

        # 5. Check Notifications:
        # - Student B (eligible) should have a broadcast notification
        login_b = await ac.post(
            "/api/v1/auth/login",
            json={"email": "studentb@iub.edu.bd", "password": "password"}
        )
        token_b = login_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        notif_b_response = await ac.get("/api/v1/notifications", headers=headers_b)
        assert notif_b_response.status_code == 200
        assert len(notif_b_response.json()) == 1
        assert "Shift Swap Broadcast" in notif_b_response.json()[0]["title"]
        notif_id = notif_b_response.json()[0]["id"]

        # Mark notification as read
        read_response = await ac.post(f"/api/v1/notifications/{notif_id}/read", headers=headers_b)
        assert read_response.status_code == 200
        assert read_response.json()["message"] == "Notification marked as read."

        # - Student C (busy) should have 0 notifications (schedule conflict!)
        notif_c_response = await ac.get("/api/v1/notifications", headers=headers_c)
        assert len(notif_c_response.json()) == 0

        # 6. Student B accepts the public swap request
        respond_response = await ac.post(
            f"/api/v1/swaps/{swap_id}/respond?approve=true",
            headers=headers_b
        )
        assert respond_response.status_code == 200
        assert respond_response.json()["status"] == "Accepted"
        assert respond_response.json()["target_student_id"] == id_b

        # Verify duty assignment changed to Student B in database
        db_duty_res = await db.execute(select(Duty).where(Duty.id == duty_id))
        db_duty = db_duty_res.scalars().first()
        assert db_duty.assigned_student_id == id_b

        # Verify Student A received notification that swap was accepted
        notif_a_response = await ac.get("/api/v1/notifications", headers=headers_a)
        assert len(notif_a_response.json()) == 1
        assert "Swap Request Accepted" in notif_a_response.json()[0]["title"]
