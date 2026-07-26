import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

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
