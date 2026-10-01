import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.model.user import User
from app.services.security import hash_password
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_register_user_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Zaid Fahad",
                "email": "zaid@iub.edu.bd",
                "department_id": "22-47318-2",
                "password": "securepassword123"
            }
        )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Zaid Fahad"
    assert data["email"] == "zaid@iub.edu.bd"
    assert data["department_id"] == "22-47318-2"
    assert data["role"] == "Student"
    assert "id" in data

@pytest.mark.asyncio
async def test_register_duplicate_email():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First registration
        await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Zaid Duplicate",
                "email": "duplicate@iub.edu.bd",
                "department_id": "22-11111-2",
                "password": "password"
            }
        )
        # Second registration with duplicate email
        response = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Another Name",
                "email": "duplicate@iub.edu.bd",
                "department_id": "22-22222-2",
                "password": "password"
            }
        )
    assert response.status_code == 400
    assert response.json()["detail"] == "A user with this email already exists."

@pytest.mark.asyncio
async def test_register_duplicate_department_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First registration
        await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Happy",
                "email": "happy@iub.edu.bd",
                "department_id": "22-55555-2",
                "password": "password"
            }
        )
        # Second registration with duplicate department ID
        response = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Different Name",
                "email": "different@iub.edu.bd",
                "department_id": "22-55555-2",
                "password": "password"
            }
        )
    assert response.status_code == 400
    assert response.json()["detail"] == "A user with this Department ID already exists."

@pytest.mark.asyncio
async def test_login_user_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register first
        await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Login User",
                "email": "login@iub.edu.bd",
                "department_id": "22-99999-2",
                "password": "password123"
            }
        )
        # Try Login
        response = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "login@iub.edu.bd",
                "password": "password123"
            }
        )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@iub.edu.bd",
                "password": "wrongpassword"
            }
        )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."


@pytest.mark.asyncio
async def test_update_profile_and_change_password():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register a test user
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Original Name",
                "email": "profile_user@iub.edu.bd",
                "department_id": "22-99887-2",
                "password": "initial_password_123"
            }
        )
        assert reg_res.status_code == 201

        # Login to get JWT
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "profile_user@iub.edu.bd",
                "password": "initial_password_123"
            }
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Update Profile (Name & Email)
        update_res = await ac.put(
            "/api/v1/auth/profile",
            headers=headers,
            json={
                "name": "Updated Profile Name",
                "email": "profile_user_updated@iub.edu.bd"
            }
        )
        assert update_res.status_code == 200
        data = update_res.json()
        assert data["user"]["name"] == "Updated Profile Name"
        assert data["user"]["email"] == "profile_user_updated@iub.edu.bd"
        
        # Use refreshed token for subsequent authenticated requests
        new_token = data["access_token"]
        auth_headers = {"Authorization": f"Bearer {new_token}"}

        # 2. Change password with incorrect current password
        bad_pw_res = await ac.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "wrong_password",
                "new_password": "brand_new_secret_pwd_456"
            }
        )
        assert bad_pw_res.status_code == 400
        assert "Current password is incorrect" in bad_pw_res.json()["detail"]

        # 3. Change password successfully
        good_pw_res = await ac.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "initial_password_123",
                "new_password": "brand_new_secret_pwd_456"
            }
        )
        assert good_pw_res.status_code == 200
        assert good_pw_res.json()["status"] == "success"

        # 4. Login with new credentials
        login_new_res = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "profile_user_updated@iub.edu.bd",
                "password": "brand_new_secret_pwd_456"
            }
        )
        assert login_new_res.status_code == 200
        assert "access_token" in login_new_res.json()

@pytest.mark.asyncio
async def test_dept_manager_reset_user_password(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register a target student
        stud_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Target Student",
                "email": "target_student@iub.edu.bd",
                "department_id": "22-88888-1",
                "password": "old_password_111"
            }
        )
        assert stud_res.status_code == 201
        target_student_id = stud_res.json()["id"]

        # 1. Student attempts to reset password -> Forbidden 403
        student_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": "target_student@iub.edu.bd", "password": "old_password_111"}
        )
        student_token = student_login.json()["access_token"]
        forbidden_res = await ac.post(
            f"/api/v1/auth/users/{target_student_id}/reset-password",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"new_password": "new_manager_pwd_999"}
        )
        assert forbidden_res.status_code == 403
        assert "Only Department Managers" in forbidden_res.json()["detail"]

        # 2. Create DeptManager user in DB and login
        mgr = User(
            name="Dept Head",
            email="dept_mgr_real@univ.edu",
            department_id="DMGR-TEST-01",
            hashed_password=hash_password("mgr_pass_123"),
            role="DeptManager"
        )
        db.add(mgr)
        await db.commit()

        login_mgr = await ac.post("/api/v1/auth/login", json={"email": "dept_mgr_real@univ.edu", "password": "mgr_pass_123"})
        mgr_token = login_mgr.json()["access_token"]

        reset_res = await ac.post(
            f"/api/v1/auth/users/{target_student_id}/reset-password",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={"new_password": "new_manager_pwd_999"}
        )
        assert reset_res.status_code == 200
        assert reset_res.json()["status"] == "success"

        # 3. Target student can now login with new password
        new_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": "target_student@iub.edu.bd", "password": "new_manager_pwd_999"}
        )
        assert new_login.status_code == 200
        assert "access_token" in new_login.json()


