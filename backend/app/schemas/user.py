from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    department_id: str = Field(..., min_length=3, max_length=20)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool = True
    rfid_tag: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr

class UserProfileResponse(BaseModel):
    user: UserResponse
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=100)

class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6, max_length=100)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
