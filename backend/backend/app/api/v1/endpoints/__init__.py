from app.api.v1.endpoints import auth
from app.api.v1.endpoints import patients
from app.api.v1.endpoints import doctors
from app.api.v1.endpoints import appointments
from app.api.v1.endpoints import medical_records
from app.api.v1.endpoints import prescriptions
from app.api.v1.endpoints import billing
from app.api.v1.endpoints import laboratory
from app.api.v1.endpoints import pharmacy
from app.api.v1.endpoints import settings
from app.api.v1.endpoints import users

__all__ = [
    "auth",
    "patients",
    "doctors",
    "appointments",
    "medical_records",
    "prescriptions",
    "billing",
    "laboratory",
    "pharmacy",
    "settings",
    "users",
]