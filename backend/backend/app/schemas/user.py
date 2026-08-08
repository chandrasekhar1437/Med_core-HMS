from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    name: Optional[str] = "John Doe"
    full_name: Optional[str] = "John Doe"
    email: EmailStr = "user@medcore.com"
    password: str = "SecretPassword123"
    role: str = "Patient"


class UserLogin(BaseModel):
    email: EmailStr = "user@medcore.com"
    password: str = "SecretPassword123"
    role: Optional[str] = "Patient"


class UserUpdate(BaseModel):
    name: Optional[str] = "Dr. John Doe"
    full_name: Optional[str] = "Dr. John Doe"
    email: Optional[EmailStr] = "newemail@medcore.com"


class PasswordChange(BaseModel):
    current_password: str = "SecretPassword123"
    new_password: str = "NewSecretPassword2026"