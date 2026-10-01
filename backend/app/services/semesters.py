from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.future import select
from sqlalchemy import func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.model.semester import Semester
from app.model.schedule import Schedule
from app.model.duty import Duty
from app.model.billing import BillingClaim
from app.schemas.semester import SemesterCreate, SemesterUpdate, SemesterStatsResponse

DEFAULT_SEMESTERS = [
    {
        "name": "Summer 2026",
        "code": "SUM26",
        "is_active": False,
        "is_onboarding_open": False,
        "start_date": "2026-05-01",
        "end_date": "2026-08-31",
    },
    {
        "name": "Autumn 2026",
        "code": "AUT26",
        "is_active": True,
        "is_onboarding_open": False,
        "start_date": "2026-09-01",
        "end_date": "2026-12-31",
    },
    {
        "name": "Spring 2027",
        "code": "SPR27",
        "is_active": False,
        "is_onboarding_open": False,
        "start_date": "2027-01-01",
        "end_date": "2027-04-30",
    },
]

async def init_semesters(db: AsyncSession) -> None:
    """Initialize default semesters if table is empty."""
    result = await db.execute(select(Semester))
    existing = result.scalars().first()
    if not existing:
        for s in DEFAULT_SEMESTERS:
            new_sem = Semester(
                name=s["name"],
                code=s["code"],
                is_active=s["is_active"],
                is_onboarding_open=s["is_onboarding_open"],
                start_date=s["start_date"],
                end_date=s["end_date"],
                created_at=datetime.now(timezone.utc),
            )
            db.add(new_sem)
        await db.commit()

async def get_all_semesters(db: AsyncSession) -> List[Semester]:
    """Retrieve all semesters ordered by id."""
    result = await db.execute(select(Semester).order_by(Semester.id.desc()))
    semesters = result.scalars().all()
    if not semesters:
        await init_semesters(db)
        result = await db.execute(select(Semester).order_by(Semester.id.desc()))
        semesters = result.scalars().all()
    return list(semesters)

async def get_active_semester(db: AsyncSession) -> Optional[Semester]:
    """Retrieve currently active semester."""
    result = await db.execute(select(Semester).where(Semester.is_active == True))
    active = result.scalars().first()
    if not active:
        # Fallback to the first semester
        all_sem = await get_all_semesters(db)
        return all_sem[0] if all_sem else None
    return active

async def get_semester_by_name(name: str, db: AsyncSession) -> Optional[Semester]:
    """Find semester by name."""
    result = await db.execute(select(Semester).where(Semester.name == name))
    return result.scalars().first()

async def create_semester(data: SemesterCreate, db: AsyncSession) -> Semester:
    """Create a new semester. If is_active is True, deactivate existing active semester."""
    # Check duplicate
    existing = await db.execute(select(Semester).where((Semester.name == data.name) | (Semester.code == data.code)))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Semester with name '{data.name}' or code '{data.code}' already exists.")

    if data.is_active:
        # Deactivate all others
        all_result = await db.execute(select(Semester))
        for sem in all_result.scalars().all():
            sem.is_active = False

    new_sem = Semester(
        name=data.name,
        code=data.code,
        is_active=data.is_active,
        is_onboarding_open=data.is_onboarding_open,
        start_date=data.start_date,
        end_date=data.end_date,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_sem)
    await db.commit()
    await db.refresh(new_sem)
    return new_sem

async def update_semester(semester_id: int, data: SemesterUpdate, db: AsyncSession) -> Semester:
    """Update semester properties, including is_onboarding_open and is_active."""
    result = await db.execute(select(Semester).where(Semester.id == semester_id))
    sem = result.scalars().first()
    if not sem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found.")

    if data.is_active is True and not sem.is_active:
        # Deactivate all others
        all_result = await db.execute(select(Semester))
        for other in all_result.scalars().all():
            other.is_active = False

    if data.name is not None:
        sem.name = data.name
    if data.code is not None:
        sem.code = data.code
    if data.is_active is not None:
        sem.is_active = data.is_active
    if data.is_onboarding_open is not None:
        sem.is_onboarding_open = data.is_onboarding_open
    if data.start_date is not None:
        sem.start_date = data.start_date
    if data.end_date is not None:
        sem.end_date = data.end_date

    await db.commit()
    await db.refresh(sem)
    return sem

async def is_onboarding_open_for_semester(semester_name: Optional[str], db: AsyncSession) -> bool:
    """Check if schedule onboarding is open for a given semester (or active semester if none provided)."""
    if semester_name:
        sem = await get_semester_by_name(semester_name, db)
    else:
        sem = await get_active_semester(db)
    
    if sem:
        return sem.is_onboarding_open
    return False

async def get_semester_stats(semester_id: int, db: AsyncSession) -> SemesterStatsResponse:
    """Compute statistics for a given semester."""
    result = await db.execute(select(Semester).where(Semester.id == semester_id))
    sem = result.scalars().first()
    if not sem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Semester not found.")

    # Distinct students with schedules in this semester
    students_res = await db.execute(
        select(func.count(distinct(Schedule.student_id))).where(Schedule.semester == sem.name)
    )
    onboarded_students = students_res.scalar() or 0

    # Total duties in this semester
    duties_res = await db.execute(
        select(func.count(Duty.id)).where(Duty.semester == sem.name)
    )
    total_duties = duties_res.scalar() or 0

    # Total billing claims in this semester
    claims_res = await db.execute(
        select(func.count(BillingClaim.id)).where(BillingClaim.semester == sem.name)
    )
    total_claims = claims_res.scalar() or 0

    return SemesterStatsResponse(
        semester_id=sem.id,
        semester_name=sem.name,
        onboarded_students_count=onboarded_students,
        total_duties_count=total_duties,
        total_claims_count=total_claims,
        is_active=sem.is_active,
        is_onboarding_open=sem.is_onboarding_open,
    )
