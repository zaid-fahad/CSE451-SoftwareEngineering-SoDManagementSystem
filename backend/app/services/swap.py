from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.model.swap import Swap
from app.model.duty import Duty
from app.model.user import User
from app.model.notification import Notification
from app.services.conflict import get_student_schedule_conflict

async def has_overlapping_duty(
    db: AsyncSession,
    student_id: int,
    date: str,
    start_time: str,
    end_time: str
) -> bool:
    """Checks if a student has an overlapping duty assignment on a given date/time."""
    result = await db.execute(
        select(Duty).where(
            (Duty.assigned_student_id == student_id) &
            (Duty.date == date) &
            (Duty.start_time < end_time) &
            (Duty.end_time > start_time)
        )
    )
    return result.scalars().first() is not None

async def broadcast_swap_notifications(
    db: AsyncSession,
    current_user: User,
    duty: Duty,
    reason: str
) -> int:
    """Finds all non-conflicted students and sends them a broadcast notification for an open shift swap."""
    student_res = await db.execute(
        select(User).where((User.role == "Student") & (User.id != current_user.id))
    )
    all_students = student_res.scalars().all()

    broadcasts_sent = 0
    for student in all_students:
        conflict = await get_student_schedule_conflict(
            db, student.id, duty.day_of_week, duty.start_time, duty.end_time
        )
        has_duty = await has_overlapping_duty(db, student.id, duty.date, duty.start_time, duty.end_time)
        
        if not conflict and not has_duty:
            notif = Notification(
                user_id=student.id,
                title="Shift Swap Broadcast",
                message=f"{current_user.name} is looking to swap their shift: '{duty.title}' on {duty.date} at {duty.start_time}-{duty.end_time}. Reason: {reason or 'Not specified'}."
            )
            db.add(notif)
            broadcasts_sent += 1

    await db.commit()
    return broadcasts_sent

async def process_swap_response(
    db: AsyncSession,
    swap: Swap,
    duty: Duty,
    current_user: User,
    approve: bool
) -> Swap:
    """Executes state changes and reassignment cascades when responding to a swap request."""
    if approve:
        swap.status = "Accepted"
        swap.target_student_id = current_user.id
        duty.assigned_student_id = current_user.id

        notif = Notification(
            user_id=swap.requester_id,
            title="Swap Request Accepted",
            message=f"{current_user.name} accepted your shift swap request for '{duty.title}' on {duty.date}."
        )
        db.add(notif)
    else:
        if swap.target_student_id:
            swap.status = "Rejected"
            notif = Notification(
                user_id=swap.requester_id,
                title="Swap Request Declined",
                message=f"{current_user.name} declined your private shift swap request for '{duty.title}' on {duty.date}."
            )
            db.add(notif)

    await db.commit()
    await db.refresh(swap)
    return swap
