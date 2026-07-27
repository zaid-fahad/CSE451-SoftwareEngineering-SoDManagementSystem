from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.model.schedule import Schedule

async def get_student_schedule_conflict(
    db: AsyncSession,
    student_id: int,
    day_of_week: str,
    start_time: str,
    end_time: str
) -> Optional[Schedule]:
    """
    Queries the database to check if a student has an overlapping schedule slot.
    Returns the Schedule record that causes the conflict, or None.
    """
    # Overlap check condition: start_time < Schedule.end_time AND end_time > Schedule.start_time
    result = await db.execute(
        select(Schedule).where(
            (Schedule.student_id == student_id) &
            (Schedule.day_of_week == day_of_week) &
            (Schedule.start_time < end_time) &
            (Schedule.end_time > start_time)
        )
    )
    return result.scalars().first()
