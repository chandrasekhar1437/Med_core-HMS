from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Dict, Any, Optional
from bson import ObjectId

from app.core.database import db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.schemas.user import UserRegister, UserLogin, UserUpdate, PasswordChange

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


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
async def register(payload: UserRegister):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_doc = {
        "email": payload.email.lower(),
        "name": payload.name,
        "role": getattr(payload, "role", "Patient"),
        "password_hash": hash_password(payload.password),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    access_token = create_access_token(data={"sub": user_id, "email": payload.email, "role": user_doc["role"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": payload.email.lower(),
            "name": payload.name,
            "role": user_doc["role"],
        },
    }


# 2. LOGIN (Handles both JSON payloads & OAuth2 Form data)
@router.post("/login")
async def login(
    payload: Optional[UserLogin] = None,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(OAuth2PasswordRequestForm)
):
    # Determine if credentials came via JSON Body or Form Data
    email_input = None
    password_input = None

    if payload and payload.email:
        email_input = payload.email.lower()
        password_input = payload.password
    elif form_data and form_data.username:
        email_input = form_data.username.lower()
        password_input = form_data.password

    if not email_input or not password_input:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = await db.users.find_one({"email": email_input})
    if not user or not verify_password(password_input, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    role = user.get("role", "Patient")
    access_token = create_access_token(data={"sub": user_id, "email": user["email"], "role": role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "name": user.get("name", "User"),
            "role": role,
        },
    }


# 3. GET CURRENT USER PROFILE
@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user


# 4. UPDATE PROFILE (Name & Email)
@router.patch("/me")
async def update_user_profile(
    payload: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["id"]
    updates = {}

    if payload.name:
        updates["name"] = payload.name

    if payload.email:
        new_email = payload.email.lower()
        existing = await db.users.find_one({"email": new_email, "_id": {"$ne": ObjectId(user_id)}})
        if existing:
            raise HTTPException(status_code=400, detail="Email is already in use by another account")
        updates["email"] = new_email

    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    updated_user.pop("password_hash", None)
    return updated_user


# 5. CHANGE PASSWORD
@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    user_id = current_user["id"]

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not verify_password(payload.current_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    new_hash = hash_password(payload.new_password)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password_hash": new_hash}})

    return {"message": "Password updated successfully"}