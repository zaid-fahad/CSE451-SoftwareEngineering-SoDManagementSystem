from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SemesterBase(BaseModel):
    name: str
    code: str
    is_active: bool = False
    is_onboarding_open: bool = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class SemesterCreate(SemesterBase):
    pass

class SemesterUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_active: Optional[bool] = None
    is_onboarding_open: Optional[bool] = None
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
    is_active: bool
    is_onboarding_open: bool
