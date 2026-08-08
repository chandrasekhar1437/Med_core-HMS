from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SettingsSchema(BaseModel):
    hospitalName: str
    email: str

# Default configuration state
settings_data = {
    "hospitalName": "MedCore HMS - Main Branch",
    "email": "anil@gmail.com"
}

@router.get("/")
def get_settings():
    return settings_data

@router.put("/")
def update_settings(payload: SettingsSchema):
    settings_data["hospitalName"] = payload.hospitalName
    settings_data["email"] = payload.email
    return settings_data