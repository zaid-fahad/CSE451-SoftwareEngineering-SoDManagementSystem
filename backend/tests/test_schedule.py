import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.parser import parse_iras_schedule

# ----------------- Parser Unit Tests -----------------

def test_parse_iras_schedule_success():
    raw = """
    PHY101 - MON - 09:00-11:00
    CSE202 - TUE - 14:00-16:00
    """
    slots = parse_iras_schedule(raw)
    assert len(slots) == 2
    assert slots[0] == {
        "course_code": "PHY101",
        "day_of_week": "Monday",
        "start_time": "09:00",
        "end_time": "11:00",
        "is_override": False
    }
    assert slots[1] == {
        "course_code": "CSE202",
        "day_of_week": "Tuesday",
        "start_time": "14:00",
        "end_time": "16:00",
        "is_override": False
    }

def test_parse_iras_schedule_invalid_format():
    raw_bad = "This is a completely random text block copied from somewhere else."
    with pytest.raises(ValueError) as exc_info:
        parse_iras_schedule(raw_bad)
    assert "Format not recognized" in str(exc_info.value)

def test_parse_iras_schedule_duplicates():
    raw_dup = """
    PHY101 - MON - 09:00-11:00
    PHY101 - MON - 09:00-11:00
    """
    slots = parse_iras_schedule(raw_dup)
    assert len(slots) == 1  # Duplicates should be filtered out

# ----------------- Router/API Endpoint Tests -----------------

@pytest.mark.asyncio
async def test_api_parse_schedule_success_and_me():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register a student user
        reg_response = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Parse Student",
                "email": "parser@iub.edu.bd",
                "department_id": "22-12345-2",
                "password": "password"
            }
        )
        assert reg_response.status_code == 201
        
        # 2. Login to get token
        login_response = await ac.post(
            "/api/v1/auth/login",
            json={"email": "parser@iub.edu.bd", "password": "password"}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Parse valid raw text schedule
        parse_response = await ac.post(
            "/api/v1/schedule/parse",
            headers=headers,
            json={"raw_text": "PHY101 - MON - 09:00-11:00\nCSE202 - WED - 14:00-16:00"}
        )
        assert parse_response.status_code == 200
        assert parse_response.json()["status"] == "success"
        assert parse_response.json()["slots_parsed"] == 2

        # 4. Fetch the schedule using GET /schedule/me
        me_response = await ac.get("/api/v1/schedule/me", headers=headers)
        assert me_response.status_code == 200
        slots = me_response.json()
        assert len(slots) == 2
        assert slots[0]["course_code"] == "PHY101"
        assert slots[1]["course_code"] == "CSE202"

@pytest.mark.asyncio
async def test_api_parse_schedule_invalid_format():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register and login
        await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Bad Parse User",
                "email": "badparse@iub.edu.bd",
                "department_id": "22-54321-2",
                "password": "password"
            }
        )
        login_response = await ac.post(
            "/api/v1/auth/login",
            json={"email": "badparse@iub.edu.bd", "password": "password"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Try to parse bad format
        parse_response = await ac.post(
            "/api/v1/schedule/parse",
            headers=headers,
            json={"raw_text": "random invalid text"}
        )
        assert parse_response.status_code == 400
        assert "Format not recognized" in parse_response.json()["detail"]

@pytest.mark.asyncio
async def test_api_override_availability():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register and login
        await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Override User",
                "email": "override@iub.edu.bd",
                "department_id": "22-67890-2",
                "password": "password"
            }
        )
        login_response = await ac.post(
            "/api/v1/auth/login",
            json={"email": "override@iub.edu.bd", "password": "password"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Add override
        response = await ac.post(
            "/api/v1/schedule/override",
            headers=headers,
            json={
                "day_of_week": "Friday",
                "start_time": "14:00",
                "end_time": "15:00",
                "is_busy": True
            }
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Override added."

        # 2. Check me schedule contains it
        me_response = await ac.get("/api/v1/schedule/me", headers=headers)
        slots = me_response.json()
        assert len(slots) == 1
        assert slots[0]["day_of_week"] == "Friday"
        assert slots[0]["is_override"] is True

        # 3. Remove override
        rem_response = await ac.post(
            "/api/v1/schedule/override",
            headers=headers,
            json={
                "day_of_week": "Friday",
                "start_time": "14:00",
                "end_time": "15:00",
                "is_busy": False
            }
        )
        assert rem_response.status_code == 200
        assert rem_response.json()["message"] == "Override removed."

        # 4. Check me schedule is empty again
        me_response2 = await ac.get("/api/v1/schedule/me", headers=headers)
        assert len(me_response2.json()) == 0
