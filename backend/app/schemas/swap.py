from pydantic import BaseModel, Field
from typing import Optional

class SwapRequest(BaseModel):
    duty_id: int
    target_student_id: Optional[int] = None
    reason: Optional[str] = None

class SwapResponse(BaseModel):
    id: int
    duty_id: int
    requester_id: int
    target_student_id: Optional[int] = None
    status: str
    reason: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True
