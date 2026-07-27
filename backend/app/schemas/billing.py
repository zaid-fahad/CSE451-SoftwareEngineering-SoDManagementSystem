from pydantic import BaseModel, Field
from typing import Optional

class BillingClaimCreate(BaseModel):
    month: str
    hours_logged: float
    hourly_rate: Optional[float] = 150.0

class BillingClaimResponse(BaseModel):
    id: int
    student_id: int
    month: str
    hours_logged: float
    hourly_rate: float
    status: str
    amount: float
    created_at: str

    class Config:
        from_attributes = True
