import os
import random
import string
import traceback
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

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

# Set prefix="" so routes bind cleanly under /api/v1/auth and /auth
router = APIRouter(prefix="", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/swagger-login")

# Environment & Mail Setup
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your_system_email@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your_app_password")
MAIL_FROM = os.getenv("MAIL_FROM", "your_system_email@gmail.com")
ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL", "admin@medcore.com")

mail_config = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

# Temporary In-Memory OTP Store & Security Trackers
OTP_STORE: Dict[str, Dict[str, Any]] = {}
FAILED_LOGIN_ATTEMPTS: Dict[str, Dict[str, Any]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


# Helper Functions
def generate_otp(length: int = 6) -> str:
    """Generates a numeric 6-digit OTP code."""
    return "".join(random.choices(string.digits, k=length))


async def send_otp_email_task(email_to: str, otp: str):
    """Sends OTP email via Gmail SMTP background task."""
    try:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #1e293b;">
            <h2 style="color: #0284c7;">MedCore HMS Verification</h2>
            <p>Your one-time email verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 4px; color: #0284c7;">{otp}</h1>
            <p>This code is valid for 10 minutes. Do not share this code with anyone.</p>
        </div>
        """
        message = MessageSchema(
            subject="MedCore HMS - Email Verification OTP",
            recipients=[email_to],
            body=html_content,
            subtype=MessageType.html,
        )
        fm = FastMail(mail_config)
        await fm.send_message(message)
    except Exception as e:
        print(f"Failed to send OTP email to {email_to}: {str(e)}")


async def send_admin_alert_task(user_email: str, event_type: str):
    """Sends account change notification alerts to the System Administrator."""
    try:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc;">
            <h3 style="color: #38bdf8;">⚙️ MedCore HMS - Security Alert</h3>
            <p><strong>Action Event:</strong> {event_type}</p>
            <p><strong>Target User:</strong> {user_email}</p>
            <p><strong>Timestamp:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
        </div>
        """
        message = MessageSchema(
            subject=f"MedCore HMS Security Notification: {event_type}",
            recipients=[ADMIN_NOTIFICATION_EMAIL],
            body=html_content,
            subtype=MessageType.html,
        )
        fm = FastMail(mail_config)
        await fm.send_message(message)
    except Exception as e:
        print(f"Failed to send admin notification email: {str(e)}")


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


# 1. SEND GMAIL OTP CODE
@router.post("/send-otp")
@router.post("/send-otp/")
async def send_otp(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
        email = str(body.get("email") or "").lower().strip()

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is required",
            )

        otp = generate_otp()
        OTP_STORE[email] = {
            "otp": otp,
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
        }

        background_tasks.add_task(send_otp_email_task, email, otp)
        return {"message": f"Verification OTP sent successfully to {email}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate OTP: {str(e)}",
        )


# 2. REGISTER WITH OTP VERIFICATION
@router.post("/register-with-otp", status_code=status.HTTP_201_CREATED)
@router.post("/register-with-otp/", status_code=status.HTTP_201_CREATED)
async def register_with_otp(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
        email = str(body.get("email") or "").lower().strip()
        otp_provided = str(body.get("otp") or "").strip()
        password = str(body.get("password") or "")
        raw_name = body.get("full_name") or body.get("name") or "User"

        clean_name = str(raw_name).strip()

        if not email or not otp_provided or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, password, and OTP code are required",
            )

        record = OTP_STORE.get(email)
        if not record or record["otp"] != otp_provided or datetime.utcnow() > record["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code",
            )

        OTP_STORE.pop(email, None)

        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        user_doc = {
            "email": email,
            "name": clean_name,
            "full_name": clean_name,
            "role": "Patient",
            "is_active": True,
            "password_hash": hash_password(password[:72]),
        }

        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        access_token = create_access_token(
            data={"sub": user_id, "email": email, "role": "Patient"}
        )

        background_tasks.add_task(
            send_admin_alert_task, email, "New Patient Registration via Gmail OTP"
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "name": clean_name,
                "full_name": clean_name,
                "role": "Patient",
            },
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration with OTP failed: {str(e)}",
        )


# 3. FORGOT PASSWORD RESET VIA OTP
@router.post("/reset-password-otp")
@router.post("/reset-password-otp/")
async def reset_password_otp(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
        email = str(body.get("email") or "").lower().strip()
        otp_provided = str(body.get("otp") or "").strip()
        new_password = str(body.get("new_password") or "")

        if not email or not otp_provided or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, OTP code, and new password are required",
            )

        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long",
            )

        record = OTP_STORE.get(email)
        if not record or record["otp"] != otp_provided or datetime.utcnow() > record["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code",
            )

        OTP_STORE.pop(email, None)

        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found",
            )

        new_hash = hash_password(new_password[:72])
        await db.users.update_one({"email": email}, {"$set": {"password_hash": new_hash}})

        background_tasks.add_task(
            send_admin_alert_task, email, "Password Reset via Gmail OTP"
        )

        return {"message": "Password reset successfully. You can now login."}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}",
        )


# 4. STANDARD REGISTER
@router.post("/register", status_code=status.HTTP_201_CREATED)
@router.post("/register/", status_code=status.HTTP_201_CREATED)
async def register(request: Request, background_tasks: BackgroundTasks):
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

        background_tasks.add_task(
            send_admin_alert_task, email, f"New Account Created ({user_role})"
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


# 5. FRONTEND JSON LOGIN
@router.post("/login")
@router.post("/login/")
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


# 6. SWAGGER FORM LOGIN
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


# 7. PROFILE ROUTE
@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user


# 8. UPDATE PROFILE (WITH ADMIN NOTIFICATION)
@router.patch("/me")
async def update_user_profile(
    payload: UserUpdate,
    background_tasks: BackgroundTasks,
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

    background_tasks.add_task(
        send_admin_alert_task,
        current_user.get("email", "User"),
        "User Profile Details Updated",
    )

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    updated_user.pop("password_hash", None)
    return updated_user


# 9. CHANGE PASSWORD
@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    user_id = current_user["id"]

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or not verify_password(payload.old_password[:72], user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    new_hash = hash_password(payload.new_password[:72])
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password_hash": new_hash}})

    background_tasks.add_task(
        send_admin_alert_task,
        current_user.get("email", "User"),
        "User Changed Password via Profile Settings",
    )

    return {"message": "Password changed successfully"}