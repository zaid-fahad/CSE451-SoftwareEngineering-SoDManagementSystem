from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import io
import csv
from app.database import get_db
from app.model.billing import BillingClaim
from app.schemas.billing import BillingClaimCreate, BillingClaimResponse
from app.services.security import get_current_user
from app.services.features import require_feature
from app.services.semesters import is_semester_archived, get_active_semester

router = APIRouter(prefix="/billing", tags=["Billing & Payroll"], dependencies=[Depends(require_feature("billing_claims"))])

@router.post("/submit", response_model=BillingClaimResponse, status_code=status.HTTP_201_CREATED)
async def submit_claim(
    claim_data: BillingClaimCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit billing claims."
        )

    # Determine semester
    target_semester = claim_data.semester
    if not target_semester:
        active_sem = await get_active_semester(db)
        target_semester = active_sem.name if active_sem else "Autumn 2026"

    # Enforce archived semester lock
    if await is_semester_archived(target_semester, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Semester '{target_semester}' has concluded and is archived. New billing claims cannot be submitted."
        )

    rate = claim_data.hourly_rate if claim_data.hourly_rate is not None else 150.0
    amount = claim_data.hours_logged * rate

    # Check if a claim already exists for this student and month
    existing = await db.execute(
        select(BillingClaim).where(
            (BillingClaim.student_id == current_user.id) &
            (BillingClaim.month == claim_data.month)
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already submitted a billing claim for {claim_data.month}."
        )

    new_claim = BillingClaim(
        student_id=current_user.id,
        month=claim_data.month,
        hours_logged=claim_data.hours_logged,
        hourly_rate=rate,
        status="Pending",
        amount=amount,
        semester=claim_data.semester or "Autumn 2026"
    )
    db.add(new_claim)
    await db.commit()
    await db.refresh(new_claim)
    return new_claim

@router.get("/claims", response_model=List[BillingClaimResponse])
async def list_claims(
    status_filter: Optional[str] = None,
    student_id_filter: Optional[int] = None,
    semester: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(BillingClaim)

    # Students can only view their own claims
    if current_user.role == "Student":
        query = query.where(BillingClaim.student_id == current_user.id)
    elif student_id_filter:
        query = query.where(BillingClaim.student_id == student_id_filter)

    if status_filter:
        query = query.where(BillingClaim.status == status_filter)

    if semester:
        query = query.where(BillingClaim.semester == semester)

    result = await db.execute(query)
    return result.scalars().all()

@router.post("/{claim_id}/approve", response_model=BillingClaimResponse)
async def approve_claim(
    claim_id: int,
    action: str,  # "verify", "approve", "pay", "reject"
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BillingClaim).where(BillingClaim.id == claim_id))
    claim = result.scalars().first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Billing claim not found.")

    if current_user.role not in ["Faculty", "LabManager", "DeptManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to review billing claims."
        )

    # Enforce archived semester lock (DeptManager emergency override only)
    if claim.semester and await is_semester_archived(claim.semester, db):
        if current_user.role != "DeptManager":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Billing claim belongs to archived semester '{claim.semester}'. Records are read-only for audit preservation. Only Department Managers can perform emergency updates."
            )

    # State machine transition rules
    if action == "verify":
        if current_user.role not in ["Faculty", "DeptManager"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Faculty/DeptManager can verify claims.")
        claim.status = "Verified"
    elif action == "approve":
        if current_user.role not in ["LabManager", "DeptManager"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Managers can approve claims.")
        claim.status = "Approved"
    elif action == "pay":
        if current_user.role not in ["DeptManager"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only DeptManager can mark claims as Paid.")
        claim.status = "Paid"
    elif action == "reject":
        claim.status = "Rejected"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid action parameter.")

    await db.commit()
    await db.refresh(claim)
    return claim

@router.get("/export")
async def export_payroll_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only Department managers or Faculty can export reports
    if current_user.role not in ["Faculty", "DeptManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to export payroll reports."
        )

    # Query all claims, eager loading the student details
    result = await db.execute(
        select(BillingClaim).options(selectinload(BillingClaim.student))
    )
    claims = result.scalars().all()

    from app.services.payroll import generate_payroll_csv

    output = generate_payroll_csv(claims)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=payroll_report.csv"}
    )
