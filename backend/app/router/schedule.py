from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.model.schedule import Schedule
from app.model.user import User
from app.schemas.schedule import (
    ScheduleParseRequest,
    ScheduleResponse,
    ScheduleOverrideRequest,
    ManagerBatchOverrideRequest
)
from app.services.security import get_current_user, require_role
from app.services.parser import parse_iras_schedule
from app.services.features import require_feature
from app.services.semesters import (
    get_active_semester,
    is_onboarding_open_for_semester
)

router = APIRouter(prefix="/schedule", tags=["Schedules"])

@router.post("/parse", response_model=dict, status_code=status.HTTP_200_OK, dependencies=[Depends(require_feature("iras_schedule_parser"))])
async def parse_schedule(
    request: ScheduleParseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check that current user is a Student
    if current_user.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can parse schedules."
        )

    # Determine semester
    target_semester = request.semester
    if not target_semester:
        active_sem = await get_active_semester(db)
        target_semester = active_sem.name if active_sem else "Autumn 2026"

    # Enforce semester schedule onboarding status check
    is_open = await is_onboarding_open_for_semester(target_semester, db)
    if not is_open:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Schedule onboarding for semester '{target_semester}' is currently closed. Contact your Lab or Department Manager to adjust your schedule."
        )

    try:
        parsed_slots = parse_iras_schedule(request.raw_text)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Delete existing non-override schedule slots for the student in this semester
    await db.execute(
        Schedule.__table__.delete().where(
            (Schedule.student_id == current_user.id) & 
            (Schedule.is_override == False) &
            (Schedule.semester == target_semester)
        )
    )

    # Insert new parsed slots tagged with the semester
    for slot in parsed_slots:
        db_slot = Schedule(
            student_id=current_user.id,
            day_of_week=slot["day_of_week"],
            start_time=slot["start_time"],
            end_time=slot["end_time"],
            course_code=slot["course_code"],
            is_override=False,
            semester=target_semester
        )
        db.add(db_slot)

    await db.commit()
    return {
        "status": "success",
        "semester": target_semester,
        "slots_parsed": len(parsed_slots),
        "conflicts_detected": 0
    }

@router.get("/me", response_model=List[ScheduleResponse])
async def get_my_schedule(
    semester: Optional[str] = Query(None, description="Optional semester filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students have availability schedules."
        )

    query = select(Schedule).where(Schedule.student_id == current_user.id)
    if semester:
        query = query.where(Schedule.semester == semester)
    else:
        active_sem = await get_active_semester(db)
        if active_sem:
            query = query.where(Schedule.semester == active_sem.name)

    result = await db.execute(query)
    return result.scalars().all()

@router.post("/override", response_model=dict)
async def toggle_override(
    request: ScheduleOverrideRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can override availability via this endpoint. Managers should use /manager-override."
        )

    target_semester = request.semester
    if not target_semester:
        active_sem = await get_active_semester(db)
        target_semester = active_sem.name if active_sem else "Autumn 2026"

    # Enforce semester schedule onboarding status check
    is_open = await is_onboarding_open_for_semester(target_semester, db)
    if not is_open:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Schedule onboarding for semester '{target_semester}' is currently closed. Contact your Lab or Department Manager to adjust your schedule."
        )

    if request.is_busy:
        # Check if an override already exists at this exact time and semester
        existing_result = await db.execute(
            select(Schedule).where(
                (Schedule.student_id == current_user.id) &
                (Schedule.day_of_week == request.day_of_week) &
                (Schedule.start_time == request.start_time) &
                (Schedule.end_time == request.end_time) &
                (Schedule.is_override == True) &
                (Schedule.semester == target_semester)
            )
        )
        if existing_result.scalars().first():
            return {"status": "success", "message": "Override already exists."}

        # Create new override slot
        new_override = Schedule(
            student_id=current_user.id,
            day_of_week=request.day_of_week,
            start_time=request.start_time,
            end_time=request.end_time,
            course_code=None,
            is_override=True,
            semester=target_semester
        )
        db.add(new_override)
        await db.commit()
        return {"status": "success", "message": "Override added."}
    else:
        # Delete the override slot
        await db.execute(
            Schedule.__table__.delete().where(
                (Schedule.student_id == current_user.id) &
                (Schedule.day_of_week == request.day_of_week) &
                (Schedule.start_time == request.start_time) &
                (Schedule.end_time == request.end_time) &
                (Schedule.is_override == True) &
                (Schedule.semester == target_semester)
            )
        )
        await db.commit()
        return {"status": "success", "message": "Override removed."}

@router.get("/student/{student_id}", response_model=List[ScheduleResponse])
async def get_student_schedule(
    student_id: int,
    semester: Optional[str] = Query(None, description="Optional semester filter"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce Manager or Faculty role check
    if current_user.role not in ["LabManager", "DeptManager", "Faculty"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and faculty can view student schedules."
        )

    # Check if student exists
    student_result = await db.execute(
        select(User).where((User.id == student_id) & (User.role == "Student"))
    )
    if not student_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )

    query = select(Schedule).where(Schedule.student_id == student_id)
    if semester:
        query = query.where(Schedule.semester == semester)
    else:
        active_sem = await get_active_semester(db)
        if active_sem:
            query = query.where(Schedule.semester == active_sem.name)

    result = await db.execute(query)
    return result.scalars().all()

@router.post("/manager-override", response_model=dict)
async def manager_override_schedule(
    request: ManagerBatchOverrideRequest,
    current_user: User = Depends(require_role(["LabManager", "DeptManager"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Allows Lab Managers and Department Managers to manually override student availability slots
    for any semester, bypassing student onboarding locks.
    """
    # Verify student exists
    student_res = await db.execute(select(User).where((User.id == request.student_id) & (User.role == "Student")))
    if not student_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    target_semester = request.semester
    if not target_semester:
        active_sem = await get_active_semester(db)
        target_semester = active_sem.name if active_sem else "Autumn 2026"

    applied_count = 0
    for item in request.overrides:
        if item.is_busy:
            # Check if override exists
            existing = await db.execute(
                select(Schedule).where(
                    (Schedule.student_id == request.student_id) &
                    (Schedule.day_of_week == item.day_of_week) &
                    (Schedule.start_time == item.start_time) &
                    (Schedule.end_time == item.end_time) &
                    (Schedule.is_override == True) &
                    (Schedule.semester == target_semester)
                )
            )
            if not existing.scalars().first():
                new_ov = Schedule(
                    student_id=request.student_id,
                    day_of_week=item.day_of_week,
                    start_time=item.start_time,
                    end_time=item.end_time,
                    course_code=None,
                    is_override=True,
                    semester=target_semester
                )
                db.add(new_ov)
                applied_count += 1
        else:
            await db.execute(
                Schedule.__table__.delete().where(
                    (Schedule.student_id == request.student_id) &
                    (Schedule.day_of_week == item.day_of_week) &
                    (Schedule.start_time == item.start_time) &
                    (Schedule.end_time == item.end_time) &
                    (Schedule.is_override == True) &
                    (Schedule.semester == target_semester)
                )
            )
            applied_count += 1

    await db.commit()
    return {
        "status": "success",
        "semester": target_semester,
        "overrides_applied": applied_count,
        "message": f"Successfully applied {applied_count} schedule override(s) for student."
    }
