from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.model.duty import Duty
from app.model.user import User
from app.schemas.duty import DutyCreate, DutyUpdate, DutyResponse
from app.services.security import get_current_user
from app.services.conflict import get_student_schedule_conflict

router = APIRouter(prefix="/tasks", tags=["Duties & Tasks"])

def get_day_name_from_date(date_str: str) -> str:
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%A")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD."
        )

@router.post("", response_model=DutyResponse, status_code=status.HTTP_201_CREATED)
async def create_duty(
    duty_data: DutyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce Manager role check
    if current_user.role not in ["LabManager", "DeptManager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can create duty slots."
        )

    day_of_week = get_day_name_from_date(duty_data.date)

    if duty_data.assigned_student_id:
        # Check student exists and is a Student
        student_result = await db.execute(
            select(User).where((User.id == duty_data.assigned_student_id) & (User.role == "Student"))
        )
        student = student_result.scalars().first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user is not a student."
            )

        # Check for schedule conflicts (Issue #6 implementation)
        conflict = await get_student_schedule_conflict(
            db, duty_data.assigned_student_id, day_of_week, duty_data.start_time, duty_data.end_time
        )
        if conflict:
            conflict_detail = {
                "course": conflict.course_code or "Manual Override",
                "time": f"{conflict.start_time} - {conflict.end_time}"
            }
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "CONFLICT_DETECTED", "message": "Student has a class during this time slot.", "detail": conflict_detail}
            )

    new_duty = Duty(
        title=duty_data.title,
        date=duty_data.date,
        day_of_week=day_of_week,
        start_time=duty_data.start_time,
        end_time=duty_data.end_time,
        assigned_student_id=duty_data.assigned_student_id,
        status="Assigned",
        notes=duty_data.notes
    )

    db.add(new_duty)
    await db.commit()
    await db.refresh(new_duty)
    return new_duty

@router.get("", response_model=List[DutyResponse])
async def list_duties(
    student_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    date_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Duty)

    # Filtering logic
    if current_user.role == "Student":
        # Students can only view their own assigned duties
        query = query.where(Duty.assigned_student_id == current_user.id)
    else:
        # Managers and Faculty can filter by student_id
        if student_id:
            query = query.where(Duty.assigned_student_id == student_id)

    if status_filter:
        query = query.where(Duty.status == status_filter)

    if date_filter:
        query = query.where(Duty.date == date_filter)

    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/{duty_id}", response_model=DutyResponse)
async def update_duty(
    duty_id: int,
    updates: DutyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Duty).where(Duty.id == duty_id))
    duty = result.scalars().first()
    if not duty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duty slot not found.")

    # Permissions checks:
    # 1. Students can only update status to "Completed" for their assigned duties
    if current_user.role == "Student":
        if duty.assigned_student_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to this duty.")
        if updates.status and updates.status != "Completed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Students can only mark tasks as Completed.")
        
        # Apply completion updates
        if updates.status:
            duty.status = updates.status
        if updates.notes:
            duty.notes = updates.notes
            
        await db.commit()
        await db.refresh(duty)
        return duty

    # 2. Managers can update everything
    if current_user.role not in ["LabManager", "DeptManager"]:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Apply date and day of week updates
    if updates.date:
        duty.date = updates.date
        duty.day_of_week = get_day_name_from_date(updates.date)

    if updates.title:
        duty.title = updates.title
    if updates.start_time:
        duty.start_time = updates.start_time
    if updates.end_time:
        duty.end_time = updates.end_time
    if updates.status:
        duty.status = updates.status
    if updates.notes:
        duty.notes = updates.notes

    # If assigned student has changed or time changed, run conflict checks
    if updates.assigned_student_id is not None and updates.assigned_student_id != duty.assigned_student_id:
        # Check student exists
        student_result = await db.execute(
            select(User).where((User.id == updates.assigned_student_id) & (User.role == "Student"))
        )
        student = student_result.scalars().first()
        if not student:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assigned user is not a student.")

        duty.assigned_student_id = updates.assigned_student_id

    # Run conflict checks if student or time slots changed
    if duty.assigned_student_id:
        conflict = await get_student_schedule_conflict(
            db, duty.assigned_student_id, duty.day_of_week, duty.start_time, duty.end_time
        )
        if conflict:
            conflict_detail = {
                "course": conflict.course_code or "Manual Override",
                "time": f"{conflict.start_time} - {conflict.end_time}"
            }
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "CONFLICT_DETECTED", "message": "Student has a class during this time slot.", "detail": conflict_detail}
            )

    await db.commit()
    await db.refresh(duty)
    return duty

@router.delete("/{duty_id}", response_model=dict)
async def delete_duty(
    duty_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["LabManager", "DeptManager"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only managers can delete duties.")

    result = await db.execute(select(Duty).where(Duty.id == duty_id))
    duty = result.scalars().first()
    if not duty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duty slot not found.")

    await db.delete(duty)
    await db.commit()
    return {"status": "success", "message": "Duty slot deleted."}
