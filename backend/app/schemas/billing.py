from pydantic import BaseModel, ConfigDict
from typing import Optional

class BillingClaimCreate(BaseModel):
    month: str
    hours_logged: float
    hourly_rate: Optional[float] = 150.0
    semester: Optional[str] = "Autumn 2026"

class BillingClaimResponse(BaseModel):
    id: int
    student_id: int
    month: str
    hours_logged: float
    hourly_rate: float
    status: str
    amount: float
    semester: str = "Autumn 2026"
    created_at: str

    model_config = ConfigDict(from_attributes=True)
