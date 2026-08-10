import traceback
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
    UserRegister,
    UserUpdate,
)

# 1. Initialize router and OAuth2 bearer scheme
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def normalize_role(role: Optional[str]) -> str:
    """Normalizes role variations (e.g., Admin vs Administrator) for accurate comparison."""
    if not role:
        return "patient"
    r = str(role).strip().lower()
    if r in ["admin", "administrator"]:
        return "administrator"
    if r in ["staff", "nurse", "medical staff", "medical staff / nurse"]:
        return "medical staff / nurse"
    return r


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Dependency to retrieve and validate the authenticated user from JWT token."""
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

        # Check for existing user
        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )

        raw_name = payload.full_name or payload.name or "User"
        user_name = str(raw_name).strip()
        user_role = str(payload.role or "Patient").strip()

        user_doc = {
            "email": email,
            "name": user_name,
            "full_name": user_name,
            "role": user_role,
            "password_hash": hash_password(payload.password),
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


# 2. LOGIN (Hybrid Handler: Supports JSON payloads from React Frontend AND Form Data from Swagger UI)
@router.post("/login")
@router.post("/login/")
async def login(
    request: Request,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(),
):
    try:
        email_raw = ""
        password = ""
        req_role = None

        content_type = request.headers.get("content-type", "")

        # Handle JSON body sent by React/Vite frontend
        if "application/json" in content_type:
            body = await request.json()
            email_raw = body.get("email") or body.get("username") or ""
            password = body.get("password") or ""
            req_role = body.get("role")
        # Handle Form Data sent by Swagger Authorize Modal
        elif form_data and form_data.username:
            email_raw = form_data.username
            password = form_data.password

        email = str(email_raw).lower().strip()

        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )

        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user_id = str(user["_id"])
        db_role = user.get("role", "Patient")

        # Validate role if specified by frontend selection
        if req_role and normalize_role(req_role) != normalize_role(db_role):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User exists as '{db_role}' but selected '{req_role}'",
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


# 3. GET PROFILE
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