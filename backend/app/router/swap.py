from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.model.swap import Swap
from app.model.duty import Duty
from app.model.user import User
from app.model.notification import Notification
from app.schemas.swap import SwapRequest, SwapResponse, NotificationResponse
from app.services.security import get_current_user
from app.services.conflict import get_student_schedule_conflict
from app.services.swap import (
    has_overlapping_duty,
    broadcast_swap_notifications,
    process_swap_response
)

router = APIRouter(prefix="/swaps", tags=["Shift Swaps"])
notif_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/request", response_model=SwapResponse, status_code=status.HTTP_201_CREATED)
async def request_swap(
    request_data: SwapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can request shift swaps."
        )

    # Verify duty exists
    duty_result = await db.execute(select(Duty).where(Duty.id == request_data.duty_id))
    duty = duty_result.scalars().first()
    if not duty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Duty slot not found.")

    # Verify requester is assigned to this duty
    if duty.assigned_student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not assigned to this duty shift."
        )

    # Check if a pending swap request already exists for this duty
    existing_swap = await db.execute(
        select(Swap).where((Swap.duty_id == duty.id) & (Swap.status == "Pending"))
    )
    if existing_swap.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pending swap request already exists for this duty slot."
        )

    if request_data.target_student_id:
        # Private swap request
        if request_data.target_student_id == current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot swap with yourself.")

        # Check target student exists
        target_res = await db.execute(
            select(User).where((User.id == request_data.target_student_id) & (User.role == "Student"))
        )
        target = target_res.scalars().first()
        if not target:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target user is not a student.")

        # Check target student conflicts
        conflict = await get_student_schedule_conflict(
            db, target.id, duty.day_of_week, duty.start_time, duty.end_time
        )
        has_duty = await has_overlapping_duty(db, target.id, duty.date, duty.start_time, duty.end_time)
        if conflict or has_duty:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Target student is busy or has another duty assignment during this shift."
            )

        # Create Swap request record
        new_swap = Swap(
            duty_id=duty.id,
            requester_id=current_user.id,
            target_student_id=target.id,
            status="Pending",
            reason=request_data.reason
        )
        db.add(new_swap)
        await db.commit()

        # Send private notification
        notif = Notification(
            user_id=target.id,
            title="Private Swap Request",
            message=f"{current_user.name} requested a private swap for '{duty.title}' on {duty.date} at {duty.start_time}-{duty.end_time}. Reason: {request_data.reason or 'Not specified'}."
        )
        db.add(notif)
        await db.commit()
        await db.refresh(new_swap)
        return new_swap

    else:
        # Public broadcast swap request
        new_swap = Swap(
            duty_id=duty.id,
            requester_id=current_user.id,
            target_student_id=None,
            status="Pending",
            reason=request_data.reason
        )
        db.add(new_swap)
        await db.commit()

        await broadcast_swap_notifications(db, current_user, duty, request_data.reason)
        await db.refresh(new_swap)
        return new_swap

@router.get("", response_model=List[SwapResponse])
async def list_swaps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        # Managers can view all swaps
        result = await db.execute(select(Swap))
        return result.scalars().all()

    # Students view requested swaps, public swaps, or private swaps targeting them
    result = await db.execute(
        select(Swap).where(
            (Swap.requester_id == current_user.id) |
            (Swap.target_student_id == None) |
            (Swap.target_student_id == current_user.id)
        )
    )
    return result.scalars().all()

@router.post("/{swap_id}/respond", response_model=SwapResponse)
async def respond_to_swap(
    swap_id: int,
    approve: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "Student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can respond to swaps.")

    swap_res = await db.execute(select(Swap).where(Swap.id == swap_id))
    swap = swap_res.scalars().first()
    if not swap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found.")

    if swap.status != "Pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This swap request has already been processed.")

    if swap.target_student_id and swap.target_student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This private swap is not addressed to you.")

    # Retrieve duty info
    duty_res = await db.execute(select(Duty).where(Duty.id == swap.duty_id))
    duty = duty_res.scalars().first()
    if not duty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Linked duty slot not found.")

    if approve:
        # Double-check conflict prevention
        conflict = await get_student_schedule_conflict(
            db, current_user.id, duty.day_of_week, duty.start_time, duty.end_time
        )
        has_duty = await has_overlapping_duty(db, current_user.id, duty.date, duty.start_time, duty.end_time)
        if conflict or has_duty:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have a schedule conflict (class or duty) during this shift."
            )

    return await process_swap_response(db, swap, duty, current_user, approve)

# ----------------- Notifications Router -----------------

@notif_router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.id.desc())
    )
    return result.scalars().all()

@notif_router.post("/{notif_id}/read", response_model=dict)
async def read_notification(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification).where(
            (Notification.id == notif_id) & (Notification.user_id == current_user.id)
        )
    )
    notif = result.scalars().first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    await db.commit()
    return {"status": "success", "message": "Notification marked as read."}
