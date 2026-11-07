from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime


class StudentProfileUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    parent_phone: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    user_id: int
    enrollment_number: str
    current_level: int
    date_of_birth: Optional[date]
    parent_name: Optional[str]
    parent_email: Optional[str]
    parent_phone: Optional[str]
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class TeacherProfileUpdate(BaseModel):
    qualification: Optional[str] = None
    center_name: Optional[str] = None
    center_address: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v

