import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.model.user import User
from app.services.security import hash_password

@pytest.mark.asyncio
async def test_list_features_public(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/features")
        assert response.status_code == 200
        data = response.json()
        assert "flags" in data
        assert "details" in data
        assert len(data["details"]) == 6
        assert "demo_mode" in data["flags"]
        assert "user_registration" in data["flags"]
        assert "shift_swaps" in data["flags"]
        assert "billing_claims" in data["flags"]
        assert "rfid_kiosk" in data["flags"]
        assert "iras_schedule_parser" in data["flags"]

@pytest.mark.asyncio
async def test_toggle_feature_permissions_and_reset(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create DeptManager user and Student user
        mgr = User(
            name="Manager Flag",
            email="mgr_flag@univ.edu",
            department_id="MGR-FLAG-1",
            hashed_password=hash_password("password"),
            role="DeptManager"
        )
        stud = User(
            name="Student Flag",
            email="stud_flag@univ.edu",
            department_id="STUD-FLAG-1",
            hashed_password=hash_password("password"),
            role="Student"
        )
        db.add_all([mgr, stud])
        await db.commit()

        # Login manager
        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "mgr_flag@univ.edu", "password": "password"})
        assert login_mgr.status_code == 200
        mgr_token = login_mgr.json()["access_token"]
        mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

        # Login student
        login_stud = await ac.post("/api/v1/auth/login", json={"email": "stud_flag@univ.edu", "password": "password"})
        assert login_stud.status_code == 200
        stud_token = login_stud.json()["access_token"]
        stud_headers = {"Authorization": f"Bearer {stud_token}"}

        # Student cannot update feature flags
        patch_stud = await ac.patch(
            "/api/v1/features/demo_mode",
            json={"enabled": True},
            headers=stud_headers
        )
        assert patch_stud.status_code == 403

        # DeptManager can update feature flags
        patch_mgr = await ac.patch(
            "/api/v1/features/demo_mode",
            json={"enabled": True},
            headers=mgr_headers
        )
        assert patch_mgr.status_code == 200
        assert patch_mgr.json()["key"] == "demo_mode"
        assert patch_mgr.json()["enabled"] is True

        # Verify list reflects updated flag
        get_res = await ac.get("/api/v1/features")
        assert get_res.json()["flags"]["demo_mode"] is True

        # DeptManager can reset flags
        reset_res = await ac.post("/api/v1/features/reset", headers=mgr_headers)
        assert reset_res.status_code == 200
        # demo_mode should be reset to default False
        get_after_reset = await ac.get("/api/v1/features")
        assert get_after_reset.json()["flags"]["demo_mode"] is False

@pytest.mark.asyncio
async def test_feature_disabled_endpoint_guards(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create DeptManager user
        mgr = User(
            name="Admin Guard",
            email="admin_guard@univ.edu",
            department_id="ADM-GUARD-1",
            hashed_password=hash_password("password"),
            role="DeptManager"
        )
        db.add(mgr)
        await db.commit()

        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "admin_guard@univ.edu", "password": "password"})
        mgr_headers = {"Authorization": f"Bearer {login_mgr.json()['access_token']}"}

        # 1. Disable user_registration and test /register
        await ac.patch("/api/v1/features/user_registration", json={"enabled": False}, headers=mgr_headers)
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Blocked Reg",
                "email": "blocked@univ.edu",
                "department_id": "BLK-001",
                "password": "password"
            }
        )
        assert reg_res.status_code == 403
        assert "disabled by system administrator" in reg_res.json()["detail"]

        # 2. Disable shift_swaps and test /swaps/request
        await ac.patch("/api/v1/features/shift_swaps", json={"enabled": False}, headers=mgr_headers)
        swap_res = await ac.post(
            "/api/v1/swaps/request",
            json={"duty_id": 1, "reason": "Testing guard"},
            headers=mgr_headers
        )
        assert swap_res.status_code == 403
        assert "disabled by system administrator" in swap_res.json()["detail"]

        # 3. Disable billing_claims and test /billing/claims
        await ac.patch("/api/v1/features/billing_claims", json={"enabled": False}, headers=mgr_headers)
        bill_res = await ac.get("/api/v1/billing/claims", headers=mgr_headers)
        assert bill_res.status_code == 403
        assert "disabled by system administrator" in bill_res.json()["detail"]

        # 4. Disable iras_schedule_parser and test /schedule/parse
        await ac.patch("/api/v1/features/iras_schedule_parser", json={"enabled": False}, headers=mgr_headers)
        parse_res = await ac.post(
            "/api/v1/schedule/parse",
            json={"raw_text": "Sample text"},
            headers=mgr_headers
        )
        assert parse_res.status_code == 403
        assert "disabled by system administrator" in parse_res.json()["detail"]

@pytest.mark.asyncio
async def test_bulk_update_features(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        mgr = User(
            name="Manager Bulk",
            email="mgr_bulk@univ.edu",
            department_id="MGR-BULK-1",
            hashed_password=hash_password("password"),
            role="DeptManager"
        )
        db.add(mgr)
        await db.commit()

        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "mgr_bulk@univ.edu", "password": "password"})
        mgr_headers = {"Authorization": f"Bearer {login_mgr.json()['access_token']}"}

        # Bulk update flags
        bulk_res = await ac.put(
            "/api/v1/features",
            json={"flags": {"demo_mode": True, "shift_swaps": False, "rfid_kiosk": False}},
            headers=mgr_headers
        )
        assert bulk_res.status_code == 200
        data = bulk_res.json()
        assert data["flags"]["demo_mode"] is True
        assert data["flags"]["shift_swaps"] is False
        assert data["flags"]["rfid_kiosk"] is False

