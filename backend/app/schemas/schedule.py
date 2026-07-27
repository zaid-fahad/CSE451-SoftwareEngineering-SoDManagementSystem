from pydantic import BaseModel, Field
from typing import Optional

class ScheduleParseRequest(BaseModel):
    raw_text: str = Field(..., description="Raw text block copied from the IRAS portal")

class ScheduleBase(BaseModel):
    day_of_week: str
    start_time: str  # HH:MM
    end_time: str    # HH:MM
    course_code: Optional[str] = None
    is_override: bool = False

class ScheduleResponse(ScheduleBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class ScheduleOverrideRequest(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    is_busy: bool = True  # True if marking busy, False if removing override
