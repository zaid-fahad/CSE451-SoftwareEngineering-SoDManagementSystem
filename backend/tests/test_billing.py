import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.model.user import User
from app.model.billing import BillingClaim

@pytest.mark.asyncio
async def test_billing_claim_and_payroll_lifecycle(db: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register a Student
        reg_std = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Student Worker",
                "email": "studentworker@iub.edu.bd",
                "department_id": "22-99901-2",
                "password": "password"
            }
        )
        assert reg_std.status_code == 201
        std_id = reg_std.json()["id"]

        # Register a Faculty
        reg_fac = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Faculty Supervisor",
                "email": "facultysup@iub.edu.bd",
                "department_id": "22-99902-2",
                "password": "password"
            }
        )
        assert reg_fac.status_code == 201
        # Make role Faculty
        db_fac_res = await db.execute(select(User).where(User.email == "facultysup@iub.edu.bd"))
        db_fac = db_fac_res.scalars().first()
        db_fac.role = "Faculty"
        await db.commit()

        # Register a Department Manager
        reg_dm = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Department Manager",
                "email": "deptmgr@iub.edu.bd",
                "department_id": "22-99903-2",
                "password": "password"
            }
        )
        assert reg_dm.status_code == 201
        # Make role DeptManager
        db_dm_res = await db.execute(select(User).where(User.email == "deptmgr@iub.edu.bd"))
        db_dm = db_dm_res.scalars().first()
        db_dm.role = "DeptManager"
        await db.commit()

        # 2. Login Student to submit a claim for "August 2026"
        login_std = await ac.post(
            "/api/v1/auth/login",
            json={"email": "studentworker@iub.edu.bd", "password": "password"}
        )
        token_std = login_std.json()["access_token"]
        headers_std = {"Authorization": f"Bearer {token_std}"}

        claim_res = await ac.post(
            "/api/v1/billing/submit",
            headers=headers_std,
            json={
                "month": "August 2026",
                "hours_logged": 24.5,
                "hourly_rate": 150.0
            }
        )
        assert claim_res.status_code == 201
        claim_id = claim_res.json()["id"]
        assert claim_res.json()["status"] == "Pending"
        assert claim_res.json()["amount"] == 24.5 * 150.0

        # Attempt to submit duplicate claim (August 2026) -> should fail
        dup_claim_res = await ac.post(
            "/api/v1/billing/submit",
            headers=headers_std,
            json={
                "month": "August 2026",
                "hours_logged": 10.0,
                "hourly_rate": 150.0
            }
        )
        assert dup_claim_res.status_code == 400

        # 3. Login Faculty to VERIFY the claim
        login_fac = await ac.post(
            "/api/v1/auth/login",
            json={"email": "facultysup@iub.edu.bd", "password": "password"}
        )
        token_fac = login_fac.json()["access_token"]
        headers_fac = {"Authorization": f"Bearer {token_fac}"}

        verify_res = await ac.post(
            f"/api/v1/billing/{claim_id}/approve?action=verify",
            headers=headers_fac
        )
        assert verify_res.status_code == 200
        assert verify_res.json()["status"] == "Verified"

        # 4. Login DeptManager to APPROVE and PAY the claim
        login_dm = await ac.post(
            "/api/v1/auth/login",
            json={"email": "deptmgr@iub.edu.bd", "password": "password"}
        )
        token_dm = login_dm.json()["access_token"]
        headers_dm = {"Authorization": f"Bearer {token_dm}"}

        approve_res = await ac.post(
            f"/api/v1/billing/{claim_id}/approve?action=approve",
            headers=headers_dm
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["status"] == "Approved"

        pay_res = await ac.post(
            f"/api/v1/billing/{claim_id}/approve?action=pay",
            headers=headers_dm
        )
        assert pay_res.status_code == 200
        assert pay_res.json()["status"] == "Paid"

        # 5. Export Payroll CSV report (DeptManager)
        export_res = await ac.get("/api/v1/billing/export", headers=headers_dm)
        assert export_res.status_code == 200
        assert export_res.headers["content-type"] == "text/csv; charset=utf-8"
        
        csv_content = export_res.text
        assert "Claim ID" in csv_content
        assert "Student Worker" in csv_content
        assert "August 2026" in csv_content
        assert "Paid" in csv_content
