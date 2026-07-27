from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.model.schedule import Schedule
from app.model.user import User
from app.schemas.schedule import (
    ScheduleParseRequest, ScheduleResponse, ScheduleOverrideRequest
)
from app.services.security import get_current_user, require_role
from app.services.parser import parse_iras_schedule

router = APIRouter(prefix="/schedule", tags=["Schedules"])

@router.post("/parse", response_model=dict, status_code=status.HTTP_200_OK)
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

    try:
        parsed_slots = parse_iras_schedule(request.raw_text)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Delete existing non-override schedule slots for the student
    await db.execute(
        Schedule.__table__.delete().where(
            (Schedule.student_id == current_user.id) & 
            (Schedule.is_override == False)
        )
    )

    # Insert new parsed slots
    for slot in parsed_slots:
        db_slot = Schedule(
            student_id=current_user.id,
            day_of_week=slot["day_of_week"],
            start_time=slot["start_time"],
            end_time=slot["end_time"],
            course_code=slot["course_code"],
            is_override=False
        )
        db.add(db_slot)

    await db.commit()
    return {
        "status": "success",
        "slots_parsed": len(parsed_slots),
        "conflicts_detected": 0
    }

@router.get("/me", response_model=List[ScheduleResponse])
async def get_my_schedule(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students have availability schedules."
        )

    result = await db.execute(
        select(Schedule).where(Schedule.student_id == current_user.id)
    )
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
            detail="Only students can override availability."
        )

    if request.is_busy:
        # Check if an override already exists at this exact time
        existing_result = await db.execute(
            select(Schedule).where(
                (Schedule.student_id == current_user.id) &
                (Schedule.day_of_week == request.day_of_week) &
                (Schedule.start_time == request.start_time) &
                (Schedule.end_time == request.end_time) &
                (Schedule.is_override == True)
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
            is_override=True
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
                (Schedule.is_override == True)
            )
        )
        await db.commit()
        return {"status": "success", "message": "Override removed."}

@router.get("/student/{student_id}", response_model=List[ScheduleResponse])
async def get_student_schedule(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce Manager role check
    if current_user.role not in ["LabManager", "DeptManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can view other student schedules."
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

    result = await db.execute(
        select(Schedule).where(Schedule.student_id == student_id)
    )
    return result.scalars().all()
