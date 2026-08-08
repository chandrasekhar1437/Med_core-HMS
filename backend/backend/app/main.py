from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all API v1 endpoints
from app.api.v1.endpoints import (
    appointments,
    auth,
    billing,
    doctors,
    laboratory,
    medical_records,
    patients,
    pharmacy,
    prescriptions,
    settings,
    users,
)

app = FastAPI(
    title="Med-core HMS",
    description="Backend API for Hospital Management System",
    version="1.0.0"
)

# Enable CORS for frontend, localtunnel & Netlify integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register Primary v1 Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["doctors"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(medical_records.router, prefix="/api/v1/medical-records", tags=["medical_records"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["prescriptions"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(laboratory.router, prefix="/api/v1/laboratory", tags=["laboratory"])
app.include_router(pharmacy.router, prefix="/api/v1/pharmacy", tags=["pharmacy"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

# Fallback Fallback Routers (Fixes potential 404s if frontend calls without /api/v1)
app.include_router(auth.router, prefix="/auth", tags=["auth-fallback"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Med-core HMS API"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Med-core HMS API"}