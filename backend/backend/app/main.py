from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Direct module imports to bypass __init__.py package resolution issues
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
    version="1.0.0",
)

# Enable CORS for all incoming requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Primary v1 Routers
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

# Fallback Routers
app.include_router(auth.router, prefix="/auth", tags=["auth-fallback"])
app.include_router(patients.router, prefix="/patients", tags=["patients-fallback"])
app.include_router(doctors.router, prefix="/doctors", tags=["doctors-fallback"])
app.include_router(appointments.router, prefix="/appointments", tags=["appointments-fallback"])
app.include_router(users.router, prefix="/users", tags=["users-fallback"])


@app.get("/")
@app.head("/")
def read_root():
    return {"status": "ok", "message": "Welcome to Med-core HMS API"}


@app.get("/health")
@app.head("/health")
def health_check():
    return {"status": "healthy", "service": "Med-core HMS API"}


# Print loaded routes on server start
print("\n================ REGISTERED ROUTES ================")
for route in app.routes:
    if hasattr(route, "path") and hasattr(route, "methods"):
        print(f"Path: {route.path} | Methods: {route.methods}")
print("====================================================\n")