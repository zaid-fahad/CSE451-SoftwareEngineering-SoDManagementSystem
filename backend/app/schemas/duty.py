from pydantic import BaseModel, Field
from typing import Optional

class DutyBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=50)
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    start_time: str = Field(..., description="Start time formatted as HH:MM")
    end_time: str = Field(..., description="End time formatted as HH:MM")
    assigned_student_id: Optional[int] = None
    notes: Optional[str] = None

class DutyCreate(DutyBase):
    pass

class DutyUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    assigned_student_id: Optional[int] = None
    status: Optional[str] = None  # Assigned, Completed, Verified, Approved
    notes: Optional[str] = None

class DutyResponse(DutyBase):
    id: int
    day_of_week: str
    status: str

    class Config:
        from_attributes = True
