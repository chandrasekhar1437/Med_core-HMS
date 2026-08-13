import traceback
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.core.database import db
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.schemas.user import (
    PasswordChange,
    UserUpdate,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/swagger-login")

# In-Memory Security Tracker for Brute-Force Rate Limiting
FAILED_LOGIN_ATTEMPTS: Dict[str, Dict[str, Any]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


def check_rate_limit(email: str):
    """Enforces brute-force protection and temporary lockout on failed logins."""
    record = FAILED_LOGIN_ATTEMPTS.get(email)
    if not record:
        return

    lockout_until = record.get("lockout_until")
    if lockout_until and datetime.utcnow() < lockout_until:
        remaining_seconds = int((lockout_until - datetime.utcnow()).total_seconds())
        remaining_minutes = max(1, remaining_seconds // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Account locked. Try again in {remaining_minutes} minute(s).",
        )


def record_failed_attempt(email: str):
    """Tracks failed login attempts and sets lockout timestamp if threshold exceeded."""
    now = datetime.utcnow()
    record = FAILED_LOGIN_ATTEMPTS.get(email, {"count": 0, "lockout_until": None})

    record["count"] += 1
    if record["count"] >= MAX_FAILED_ATTEMPTS:
        record["lockout_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)

    FAILED_LOGIN_ATTEMPTS[email] = record


def reset_failed_attempts(email: str):
    """Clears failed login attempt counter upon successful authentication."""
    FAILED_LOGIN_ATTEMPTS.pop(email, None)


def normalize_role(role: Optional[str]) -> str:
    """Normalizes role variations across Admin, Patient, Doctor, and Staff."""
    if not role:
        return "patient"
    r = str(role).strip().lower()
    if r in ["admin", "administrator"]:
        return "admin"
    if r in ["staff", "nurse", "medical staff", "medical staff / nurse"]:
        return "staff"
    if r in ["doctor", "physician"]:
        return "doctor"
    return "patient"


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_exception

    user_id = payload["sub"]
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exception

    if not user:
        raise credentials_exception

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    user["id"] = str(user.pop("_id"))
    user.pop("password_hash", None)
    return user


# 1. REGISTER
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: Request):
    try:
        body = await request.json()
        email_raw = body.get("email") or body.get("username") or ""
        password = str(body.get("password") or "")
        raw_name = body.get("full_name") or body.get("name") or "User"
        req_role = body.get("role") or "Patient"

        email = str(email_raw).lower().strip()
        user_name = str(raw_name).strip()
        user_role = str(req_role).strip()

        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )

        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long",
            )

        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        user_doc = {
            "email": email,
            "name": user_name,
            "full_name": user_name,
            "role": user_role,
            "is_active": True,
            "password_hash": hash_password(password[:72]),
        }

        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        access_token = create_access_token(
            data={"sub": user_id, "email": email, "role": user_role}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "name": user_name,
                "full_name": user_name,
                "role": user_role,
            },
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print("\n--- REGISTRATION ERROR TRACEBACK ---")
        traceback.print_exc()
        print("------------------------------------\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


# 2. FRONTEND JSON LOGIN
@router.post("/login")
async def login(request: Request):
    try:
        body = await request.json()
        email_raw = body.get("email") or body.get("username") or ""
        password = str(body.get("password") or "")
        req_role = body.get("role")

        email = str(email_raw).lower().strip()

        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )

        # Rate Limit Check
        check_rate_limit(email)

        user = await db.users.find_one({"email": email})

        if not user or not verify_password(password[:72], user.get("password_hash", "")):
            record_failed_attempt(email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials.",
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been disabled. Please contact system support.",
            )

        # Successful Login -> Reset Attempt Tracker
        reset_failed_attempts(email)

        user_id = str(user["_id"])
        db_role = user.get("role") or "Patient"

        if req_role and normalize_role(req_role) != normalize_role(db_role):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Account is registered as '{db_role}'. Please switch to that role.",
            )

        access_token = create_access_token(
            data={"sub": user_id, "email": user["email"], "role": db_role}
        )

        user_name = user.get("name") or user.get("full_name") or "User"

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "name": user_name,
                "full_name": user_name,
                "role": db_role,
            },
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print("\n--- LOGIN ERROR TRACEBACK ---")
        traceback.print_exc()
        print("------------------------------\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


# 3. SWAGGER FORM LOGIN
@router.post("/swagger-login", include_in_schema=False)
async def swagger_login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = str(form_data.username).lower().strip()
    password = str(form_data.password)

    check_rate_limit(email)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password[:72], user.get("password_hash", "")):
        record_failed_attempt(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled",
        )

    reset_failed_attempts(email)

    user_id = str(user["_id"])
    db_role = user.get("role", "Patient")

    access_token = create_access_token(
        data={"sub": user_id, "email": user["email"], "role": db_role}
    )

    user_name = user.get("name") or user.get("full_name") or "User"

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": email,
            "name": user_name,
            "full_name": user_name,
            "role": db_role,
        },
    }


# 4. PROFILE ROUTE
@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user


# 5. UPDATE PROFILE
@router.patch("/me")
async def update_user_profile(
    payload: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    user_id = current_user["id"]
    updates = {}

    if payload.name:
        clean_name = payload.name.strip()
        updates["name"] = clean_name
        updates["full_name"] = clean_name

    if payload.email:
        new_email = payload.email.lower().strip()
        existing = await db.users.find_one(
            {"email": new_email, "_id": {"$ne": ObjectId(user_id)}}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another account",
            )
        updates["email"] = new_email

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update",
        )

    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    updated_user.pop("password_hash", None)
    return updated_user


# 6. CHANGE PASSWORD
@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    user_id = current_user["id"]

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long",
        )

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not verify_password(payload.current_password[:72], user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    new_hash = hash_password(payload.new_password[:72])
    await db.users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"password_hash": new_hash}}
    )

    return {"message": "Password updated successfully"}