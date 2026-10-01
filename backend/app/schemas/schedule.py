from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class ScheduleParseRequest(BaseModel):
    raw_text: str = Field(..., description="Raw text block copied from the IRAS portal")
    semester: Optional[str] = Field(default=None, description="Target semester name e.g. 'Autumn 2026'")

class ScheduleBase(BaseModel):
    day_of_week: str
    start_time: str  # HH:MM
    end_time: str    # HH:MM
    course_code: Optional[str] = None
    is_override: bool = False
    semester: str = "Autumn 2026"

class ScheduleResponse(ScheduleBase):
    id: int
    student_id: int

    model_config = ConfigDict(from_attributes=True)

class ScheduleOverrideRequest(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    is_busy: bool = True  # True if marking busy, False if removing override
    semester: Optional[str] = None

class ManagerOverrideSlotItem(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    is_busy: bool = True

class ManagerBatchOverrideRequest(BaseModel):
    student_id: int
    semester: Optional[str] = None
    overrides: List[ManagerOverrideSlotItem]
