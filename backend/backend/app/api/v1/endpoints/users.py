from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
from bson import ObjectId

from app.core.database import db
from app.core.security import hash_password

router = APIRouter(prefix="", tags=["users"])


def fix_object_id(doc: dict) -> dict:
    if not isinstance(doc, dict):
        return doc
    new_doc = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            new_doc[k if k != "_id" else "id"] = str(v)
        elif isinstance(v, dict):
            new_doc[k] = fix_object_id(v)
        elif isinstance(v, list):
            new_doc[k] = [fix_object_id(item) if isinstance(item, dict) else item for item in v]
        else:
            new_doc[k] = v
    if "_id" in new_doc and "id" not in new_doc:
        new_doc["id"] = str(new_doc.pop("_id"))
    
    # Always strip sensitive password hashes from user responses
    new_doc.pop("password_hash", None)
    return new_doc


def normalize_role(role: Optional[str]) -> str:
    if not role:
        return "Patient"
    r = str(role).strip().lower()
    if r in ["admin", "administrator"]:
        return "Admin"
    if r in ["staff", "nurse", "medical staff", "medical staff / nurse"]:
        return "Staff"
    if r in ["doctor", "physician"]:
        return "Doctor"
    return "Patient"


# 1. GET ALL USERS
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_users():
    try:
        if db is None:
            return []
        cursor = db.users.find({})
        users = await cursor.to_list(length=100)
        return [fix_object_id(u) for u in users]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# 2. GET USER BY ID
@router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        return fix_object_id(user)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# 3. CREATE USER / PROVISION ACCOUNT (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(payload: Dict[Any, Any]):
    try:
        email_raw = payload.get("email") or payload.get("username") or ""
        password = str(payload.get("password") or "")
        raw_name = payload.get("full_name") or payload.get("name") or "User"
        req_role = payload.get("role") or "Patient"

        email = str(email_raw).lower().strip()
        user_name = str(raw_name).strip()
        user_role = normalize_role(req_role)

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required",
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
        }

        # Hash password if provided during account provisioning
        if password:
            user_doc["password_hash"] = hash_password(password[:72])

        result = await db.users.insert_one(user_doc)
        created = await db.users.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# 4. EDIT / REPLACE USER (PUT)
@router.put("/{user_id}")
async def edit_user_put(user_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)

        if "password" in payload:
            raw_pwd = str(payload.pop("password"))
            if raw_pwd:
                payload["password_hash"] = hash_password(raw_pwd[:72])

        if "role" in payload:
            payload["role"] = normalize_role(payload["role"])

        result = await db.users.replace_one(
            {"_id": ObjectId(user_id)},
            payload
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        updated = await db.users.find_one({"_id": ObjectId(user_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# 5. PARTIAL UPDATE USER (PATCH)
@router.patch("/{user_id}")
async def update_user(user_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        if "password" in update_data:
            raw_pwd = str(update_data.pop("password"))
            if raw_pwd:
                update_data["password_hash"] = hash_password(raw_pwd[:72])

        if "role" in update_data:
            update_data["role"] = normalize_role(update_data["role"])

        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        updated = await db.users.find_one({"_id": ObjectId(user_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# 6. DELETE USER
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format")
            
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))