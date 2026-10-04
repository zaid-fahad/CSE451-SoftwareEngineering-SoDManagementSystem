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


def test_parse_iras_schedule_table_rows():
    raw_table = """
Code	Name	Sec	Room	Time	Attendance*	Attendance %	Grade
CSE204	Digital Logic Design	1	MK5006	ST:11:20-12:50	13 / 26	50 %	Z
CSE210L	Labwork based on CSE 210	1	CENLAB3	W:09:40-11:10	12 / 24	50 %	W
    """
    slots = parse_iras_schedule(raw_table)
    # CSE204 on ST creates 2 slots (Sunday & Tuesday), CSE210L on W creates 1 slot (Wednesday)
    assert len(slots) == 3
    
    # Assert Sunday slot
    assert any(s["course_code"] == "CSE204" and s["day_of_week"] == "Sunday" and s["start_time"] == "11:20" for s in slots)
    # Assert Tuesday slot
    assert any(s["course_code"] == "CSE204" and s["day_of_week"] == "Tuesday" and s["start_time"] == "11:20" for s in slots)
    # Assert Wednesday slot
    assert any(s["course_code"] == "CSE210L" and s["day_of_week"] == "Wednesday" and s["start_time"] == "09:40" for s in slots)


def test_parse_iras_schedule_merged_code_title():
    raw_text = (
        "Code\tName\tSec\tRoom\tTime\tAttendance*\t%\tGrade\n"
        "CSE204Digital Logic Design\t1\tBC6012\tST:11:20-12:50\t1 / 9\t11.11%\tZ\n"
        "CSE204LLabwork based on CSE 204\t3\tCENLAB2\tW:09:40-11:10\t1 / 9\t11.11%\tZ\n"
        "CSE210Electronics I\t1\tBC6008\tMW:11:20-12:50\t2 / 7\t28.57%\tZ\n"
        "CSE210LLabwork based on CSE 210\t1\tCENLAB3\tM:13:00-14:30\t2 / 7\t28.57%\tZ\n"
        "MAT203Linear Algebra- vectors and matrices\t3\tC6005\tMW:14:40-16:10\t3 / 6\t50%\tZ"
    )
    slots = parse_iras_schedule(raw_text)
    # ST -> 2 slots (CSE204: Sun, Tue)
    # W -> 1 slot (CSE204L: Wed)
    # MW -> 2 slots (CSE210: Mon, Wed)
    # M -> 1 slot (CSE210L: Mon)
    # MW -> 2 slots (MAT203: Mon, Wed)
    # Total: 2 + 1 + 2 + 1 + 2 = 8 slots
    assert len(slots) == 8

    # Validate individual extracted codes
    codes = {s["course_code"] for s in slots}
    assert codes == {"CSE204", "CSE204L", "CSE210", "CSE210L", "MAT203"}

    # Validate specific slots
    assert any(s["course_code"] == "CSE204" and s["day_of_week"] == "Sunday" and s["start_time"] == "11:20" and s["end_time"] == "12:50" for s in slots)
    assert any(s["course_code"] == "CSE204L" and s["day_of_week"] == "Wednesday" and s["start_time"] == "09:40" and s["end_time"] == "11:10" for s in slots)
    assert any(s["course_code"] == "CSE210" and s["day_of_week"] == "Monday" and s["start_time"] == "11:20" and s["end_time"] == "12:50" for s in slots)
    assert any(s["course_code"] == "CSE210L" and s["day_of_week"] == "Monday" and s["start_time"] == "13:00" and s["end_time"] == "14:30" for s in slots)
    assert any(s["course_code"] == "MAT203" and s["day_of_week"] == "Wednesday" and s["start_time"] == "14:40" and s["end_time"] == "16:10" for s in slots)

