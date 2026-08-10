from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import endpoint package cleanly using relative route loading
from app.api.v1 import endpoints

app = FastAPI(
    title="Med-core HMS",
    description="Backend API for Hospital Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Primary v1 Routers
app.include_router(endpoints.auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(endpoints.patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(endpoints.doctors.router, prefix="/api/v1/doctors", tags=["doctors"])
app.include_router(endpoints.appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(endpoints.medical_records.router, prefix="/api/v1/medical-records", tags=["medical_records"])
app.include_router(endpoints.prescriptions.router, prefix="/api/v1/prescriptions", tags=["prescriptions"])
app.include_router(endpoints.billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(endpoints.laboratory.router, prefix="/api/v1/laboratory", tags=["laboratory"])
app.include_router(endpoints.pharmacy.router, prefix="/api/v1/pharmacy", tags=["pharmacy"])
app.include_router(endpoints.settings.router, prefix="/api/v1/settings", tags=["settings"])
app.include_router(endpoints.users.router, prefix="/api/v1/users", tags=["users"])

# Fallback Routers
app.include_router(endpoints.auth.router, prefix="/auth", tags=["auth-fallback"])

@app.get("/")
@app.head("/")
def read_root():
    return {"status": "ok", "message": "Welcome to Med-core HMS API"}

@app.get("/health")
@app.head("/health")
def health_check():
    return {"status": "healthy", "service": "Med-core HMS API"}

print("\n================ REGISTERED ROUTES ================")
for route in app.routes:
    if hasattr(route, "path") and hasattr(route, "methods"):
        print(f"Path: {route.path} | Methods: {route.methods}")
print("====================================================\n")