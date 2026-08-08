from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


class ProfileUpdate(BaseModel):
    name: str
    phone: str


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class PreferencesUpdate(BaseModel):
    dark_mode: bool
    email_notifications: bool


@router.get("/me")
async def get_my_profile():
    return {
        "name": "Test User",
        "phone": "",
        "dark_mode": False,
        "email_notifications": True,
    }


@router.patch("/me")
async def update_my_profile(data: ProfileUpdate):
    return {
        "message": "Profile updated successfully.",
        "name": data.name,
        "phone": data.phone,
    }


@router.patch("/me/password")
async def change_my_password(data: PasswordUpdate):
    if not data.current_password:
        raise HTTPException(
            status_code=400,
            detail="Current password is required."
        )

    return {
        "message": "Password changed successfully."
    }


@router.patch("/me/preferences")
async def update_preferences(data: PreferencesUpdate):
    return {
        "message": "Preferences updated successfully.",
        "dark_mode": data.dark_mode,
        "email_notifications": data.email_notifications,
    }