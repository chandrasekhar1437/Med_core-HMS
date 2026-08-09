from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "Patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str