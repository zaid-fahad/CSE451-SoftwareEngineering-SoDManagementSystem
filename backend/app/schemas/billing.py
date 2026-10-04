from pydantic import BaseModel, ConfigDict
from typing import Optional

class BillingClaimCreate(BaseModel):
    month: str
    hours_logged: float
    hourly_rate: Optional[float] = 150.0
    semester: Optional[str] = "Autumn 2026"
    week_number: Optional[int] = None

class ManualBillingClaimCreate(BaseModel):
    student_id: int
    month: str
    hours_logged: float
    hourly_rate: Optional[float] = 150.0
    semester: Optional[str] = "Autumn 2026"
    week_number: Optional[int] = None

class BillingClaimResponse(BaseModel):
    id: int
    student_id: int
    month: str
    hours_logged: float
    hourly_rate: float
    status: str
    amount: float
    semester: str = "Autumn 2026"
    week_number: Optional[int] = None
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    paid_by: Optional[str] = None
    paid_at: Optional[str] = None
    dispute_reason: Optional[str] = None
    created_at: str

    model_config = ConfigDict(from_attributes=True)
