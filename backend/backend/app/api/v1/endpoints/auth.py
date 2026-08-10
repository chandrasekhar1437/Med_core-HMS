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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/swagger-login")


def normalize_role(role: Optional[str]) -> str:
    """Normalizes role variations for accurate comparison."""
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


# 2. LOGIN FOR FRONTEND (Accepts raw JSON body without 422 errors)
@router.post("/login")
@router.post("/login/")
async def login(request: Request):
    try:
        body = await request.json()
        email_raw = body.get("email") or body.get("username") or ""
        password = body.get("password") or ""
        req_role = body.get("role")

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
        db_role = user.get("role") or "Patient"

        if req_role:
            if normalize_role(req_role) != normalize_role(db_role):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Account registered as '{db_role}'. Please change your selected role.",
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


# 3. LOGIN FOR SWAGGER UI AUTHORIZE MODAL (Handles form-data)
@router.post("/swagger-login", include_in_schema=False)
async def swagger_login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = str(form_data.username).lower().strip()
    password = form_data.password

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

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
            "email": user["email"],
            "name": user_name,
            "full_name": user_name,
            "role": db_role,
        },
    }


# 4. GET PROFILE
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