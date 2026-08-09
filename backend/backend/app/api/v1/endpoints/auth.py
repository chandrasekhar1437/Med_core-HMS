from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any, Optional
from bson import ObjectId
import traceback

from app.core.database import db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    PasswordChange,
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def normalize_role(role: Optional[str]) -> str:
    """Normalizes role variations (e.g., Admin vs Administrator) for clean comparisons."""
    if not role:
        return "patient"
    r = str(role).strip().lower()
    if r in ["admin", "administrator"]:
        return "administrator"
    if r in ["staff", "nurse", "medical staff", "medical staff / nurse"]:
        return "medical staff / nurse"
    return r


# HELPER: Get authenticated user from JWT token
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

    user["id"] = str(user.pop("_id"))
    user.pop("password_hash", None)
    return user


# 1. REGISTER
@router.post("/register", status_code=status.HTTP_201_CREATED)
@router.post("/register/", status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    try:
        email = str(payload.email).lower().strip()

        # Check existing user
        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        # Handle name variations safely
        raw_name = (
            getattr(payload, "full_name", None)
            or getattr(payload, "name", None)
            or "User"
        )
        user_name = str(raw_name).strip() if raw_name else "User"

        # Handle role
        raw_role = getattr(payload, "role", "Patient") or "Patient"
        user_role = str(raw_role).strip()

        # Document structure
        user_doc = {
            "email": email,
            "name": user_name,
            "full_name": user_name,
            "role": user_role,
            "password_hash": hash_password(payload.password),
        }

        # Insert to MongoDB
        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Create JWT Access Token
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


# 2. LOGIN
@router.post("/login")
@router.post("/login/")
async def login(payload: UserLogin):
    try:
        email = str(payload.email).lower().strip()
        password = payload.password

        # Query user
        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user_id = str(user["_id"])
        db_role = user.get("role", "Patient")

        # Flexible role validation using normalize_role helper
        req_role = getattr(payload, "role", None)
        if req_role and normalize_role(req_role) != normalize_role(db_role):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User exists as '{db_role}' but selected '{req_role}'",
            )

        # Generate Token
        access_token = create_access_token(
            data={"sub": user_id, "email": user["email"], "role": db_role}
        )

        user_name = user.get("name") or user.get("full_name") or "User"

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user["email"],
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


# 3. GET CURRENT USER PROFILE
@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user


# 4. UPDATE PROFILE
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


# 5. CHANGE PASSWORD
@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    user_id = current_user["id"]

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not verify_password(payload.current_password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )

    new_hash = hash_password(payload.new_password)
    await db.users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"password_hash": new_hash}}
    )

    return {"message": "Password updated successfully"}