import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import db
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
    ward_management,
)

START_TIME = time.time()

app = FastAPI(
    title="Med-core HMS",
    description="Backend API for MedCore Hospital Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration supporting credentials and wildcards across environments
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Primary API v1 Router Inclusion ---
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["doctors"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(medical_records.router, prefix="/api/v1/medical-records", tags=["medical_records"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["prescriptions"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(laboratory.router, prefix="/api/v1/laboratory", tags=["laboratory"])
app.include_router(pharmacy.router, prefix="/api/v1/pharmacy", tags=["pharmacy"])
app.include_router(ward_management.router, prefix="/api/v1/ward-management", tags=["ward_management"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

# --- Fallback Routes (Supports legacy/direct path variations) ---
app.include_router(auth.router, prefix="/auth", tags=["auth_fallback"], include_in_schema=False)
app.include_router(users.router, prefix="/users", tags=["users_fallback"], include_in_schema=False)


@app.on_event("startup")
async def startup_event():
    print("🚀 Starting MedCore HMS Backend API Service...")


@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Shutting down MedCore HMS Backend API Service...")


@app.get("/")
@app.head("/")
def read_root():
    return {
        "status": "ok",
        "service": "Med-core HMS API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
@app.head("/health")
def health_check():
    uptime_seconds = int(time.time() - START_TIME)
    db_connected = db is not None
    return {
        "status": "healthy" if db_connected else "degraded",
        "service": "Med-core HMS API",
        "database_status": "connected" if db_connected else "disconnected",
        "uptime_seconds": uptime_seconds,
    }