from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    patients,
    records,
    appointments,
    doctors,
    billing,
    medical_records,
    prescriptions,
    pharmacy
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
api_router.include_router(records.router, prefix="/records", tags=["Records"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["Doctors"])
api_router.include_router(billing.router, prefix="/billing", tags=["Billing"])
api_router.include_router(medical_records.router, prefix="/medical-records", tags=["Medical Records"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescriptions"])
api_router.include_router(pharmacy.router, prefix="/pharmacy", tags=["Pharmacy"])