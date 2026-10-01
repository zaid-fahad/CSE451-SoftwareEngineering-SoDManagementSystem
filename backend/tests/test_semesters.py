import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.model.user import User
from app.model.semester import Semester
from app.services.security import hash_password

@pytest.mark.asyncio
async def test_semester_crud_and_permissions(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create users
        mgr = User(
            name="Manager Sem",
            email="mgr_sem@univ.edu",
            department_id="MGR-SEM-1",
            hashed_password=hash_password("password"),
            role="DeptManager"
        )
        stud = User(
            name="Student Sem",
            email="stud_sem@univ.edu",
            department_id="STUD-SEM-1",
            hashed_password=hash_password("password"),
            role="Student"
        )
        db.add_all([mgr, stud])
        await db.commit()

        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "mgr_sem@univ.edu", "password": "password"})
        mgr_headers = {"Authorization": f"Bearer {login_mgr.json()['access_token']}"}

        login_stud = await ac.post("/api/v1/auth/login", json={"email": "stud_sem@univ.edu", "password": "password"})
        stud_headers = {"Authorization": f"Bearer {login_stud.json()['access_token']}"}

        # 1. Public list semesters
        res = await ac.get("/api/v1/semesters")
        assert res.status_code == 200
        semesters = res.json()
        assert len(semesters) >= 3

        # 2. Get active semester
        active_res = await ac.get("/api/v1/semesters/active")
        assert active_res.status_code == 200
        assert active_res.json()["name"] == "Autumn 2026"

        # 3. Student cannot create semester
        fail_create = await ac.post(
            "/api/v1/semesters",
            json={"name": "Winter 2027", "code": "WIN27", "is_active": False, "is_onboarding_open": False},
            headers=stud_headers
        )
        assert fail_create.status_code == 403

        # 4. Manager can create semester
        success_create = await ac.post(
            "/api/v1/semesters",
            json={"name": "Winter 2027", "code": "WIN27", "is_active": False, "is_onboarding_open": False},
            headers=mgr_headers
        )
        assert success_create.status_code == 201
        created_id = success_create.json()["id"]

        # 5. Manager can update semester (toggle onboarding)
        patch_res = await ac.patch(
            f"/api/v1/semesters/{created_id}",
            json={"is_onboarding_open": True},
            headers=mgr_headers
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["is_onboarding_open"] is True

        # 6. Read stats
        stats_res = await ac.get(f"/api/v1/semesters/{created_id}/stats", headers=mgr_headers)
        assert stats_res.status_code == 200
        assert stats_res.json()["onboarded_students_count"] == 0

@pytest.mark.asyncio
async def test_student_onboarding_closed_and_open_lock(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        mgr = User(
            name="Manager Lock",
            email="mgr_lock@univ.edu",
            department_id="MGR-LCK-1",
            hashed_password=hash_password("password"),
            role="DeptManager"
        )
        stud = User(
            name="Student Lock",
            email="stud_lock@univ.edu",
            department_id="STUD-LCK-1",
            hashed_password=hash_password("password"),
            role="Student"
        )
        db.add_all([mgr, stud])
        await db.commit()

        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "mgr_lock@univ.edu", "password": "password"})
        mgr_headers = {"Authorization": f"Bearer {login_mgr.json()['access_token']}"}

        login_stud = await ac.post("/api/v1/auth/login", json={"email": "stud_lock@univ.edu", "password": "password"})
        stud_headers = {"Authorization": f"Bearer {login_stud.json()['access_token']}"}

        # Find Autumn 2026 semester
        sems_res = await ac.get("/api/v1/semesters")
        autumn = next(s for s in sems_res.json() if s["name"] == "Autumn 2026")

        # 1. Set Autumn 2026 onboarding to CLOSED
        await ac.patch(f"/api/v1/semesters/{autumn['id']}", json={"is_onboarding_open": False}, headers=mgr_headers)

        # 2. Student attempts to parse IRAS schedule -> Expect 403 Forbidden
        raw_text = "CSE451 - MON - 09:00-11:00\n"
        parse_fail = await ac.post(
            "/api/v1/schedule/parse",
            json={"raw_text": raw_text, "semester": "Autumn 2026"},
            headers=stud_headers
        )
        assert parse_fail.status_code == 403
        assert "onboarding for semester 'Autumn 2026' is currently closed" in parse_fail.json()["detail"]

        # 3. Student attempts to toggle override -> Expect 403 Forbidden
        ov_fail = await ac.post(
            "/api/v1/schedule/override",
            json={"day_of_week": "Monday", "start_time": "12:00", "end_time": "14:00", "is_busy": True, "semester": "Autumn 2026"},
            headers=stud_headers
        )
        assert ov_fail.status_code == 403
        assert "onboarding for semester 'Autumn 2026' is currently closed" in ov_fail.json()["detail"]

        # 4. Open onboarding
        await ac.patch(f"/api/v1/semesters/{autumn['id']}", json={"is_onboarding_open": True}, headers=mgr_headers)

        # 5. Student attempts again -> Expect 200 Success
        parse_ok = await ac.post(
            "/api/v1/schedule/parse",
            json={"raw_text": raw_text, "semester": "Autumn 2026"},
            headers=stud_headers
        )
        assert parse_ok.status_code == 200
        assert parse_ok.json()["status"] == "success"

        ov_ok = await ac.post(
            "/api/v1/schedule/override",
            json={"day_of_week": "Monday", "start_time": "12:00", "end_time": "14:00", "is_busy": True, "semester": "Autumn 2026"},
            headers=stud_headers
        )
        assert ov_ok.status_code == 200
        assert ov_ok.json()["status"] == "success"

@pytest.mark.asyncio
async def test_manager_override_bypasses_closed_onboarding(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        mgr = User(
            name="Manager Bypasser",
            email="mgr_bypass@univ.edu",
            department_id="MGR-BYP-1",
            hashed_password=hash_password("password"),
            role="LabManager"
        )
        stud = User(
            name="Student Bypassed",
            email="stud_bypass@univ.edu",
            department_id="STUD-BYP-1",
            hashed_password=hash_password("password"),
            role="Student"
        )
        db.add_all([mgr, stud])
        await db.commit()

        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "mgr_bypass@univ.edu", "password": "password"})
        mgr_headers = {"Authorization": f"Bearer {login_mgr.json()['access_token']}"}

        # Set Autumn 2026 onboarding to CLOSED
        sems_res = await ac.get("/api/v1/semesters")
        autumn = next(s for s in sems_res.json() if s["name"] == "Autumn 2026")
        await ac.patch(f"/api/v1/semesters/{autumn['id']}", json={"is_onboarding_open": False}, headers=mgr_headers)

        # Manager performs batch override for student
        ov_res = await ac.post(
            "/api/v1/schedule/manager-override",
            json={
                "student_id": stud.id,
                "semester": "Autumn 2026",
                "overrides": [
                    {"day_of_week": "Tuesday", "start_time": "10:00", "end_time": "12:00", "is_busy": True},
                    {"day_of_week": "Thursday", "start_time": "14:00", "end_time": "16:00", "is_busy": True}
                ]
            },
            headers=mgr_headers
        )
        assert ov_res.status_code == 200
        assert ov_res.json()["overrides_applied"] == 2

        # Verify student schedule now contains the overrides
        sched_res = await ac.get(f"/api/v1/schedule/student/{stud.id}?semester=Autumn%202026", headers=mgr_headers)
        assert sched_res.status_code == 200
        slots = sched_res.json()
        assert len(slots) == 2
        assert all(s["is_override"] for s in slots)
