from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SemesterBase(BaseModel):
    name: str
    code: str
    is_active: bool = False
    is_onboarding_open: bool = False
    is_archived: bool = False
    status: Optional[str] = "Upcoming"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SemesterCreate(SemesterBase):
    pass

class SemesterUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_active: Optional[bool] = None
    is_onboarding_open: Optional[bool] = None
    is_archived: Optional[bool] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SemesterResponse(SemesterBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SemesterStatsResponse(BaseModel):
    semester_id: int
    semester_name: str
    onboarded_students_count: int
    total_duties_count: int
    total_claims_count: int
    total_payout: float = 0.0
    total_duty_hours: float = 0.0
    is_active: bool
    is_onboarding_open: bool
    is_archived: bool = False
    status: str = "Upcoming"
