from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId

from app.core.database import db

router = APIRouter(prefix="", tags=["doctors"])

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
    return new_doc

# 1. GET ALL DOCTORS
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_doctors():
    try:
        if db is None:
            return []
        cursor = db.doctors.find({})
        doctors = await cursor.to_list(length=100)
        return [fix_object_id(d) for d in doctors]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. GET DOCTOR BY ID
@router.get("/{doctor_id}")
async def get_doctor_by_id(doctor_id: str):
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(status_code=400, detail="Invalid doctor ID format")
        
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
            
        return fix_object_id(doctor)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. CREATE DOCTOR (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_doctor(payload: Dict[Any, Any]):
    try:
        result = await db.doctors.insert_one(payload)
        created = await db.doctors.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. EDIT / REPLACE DOCTOR (PUT)
@router.put("/{doctor_id}")
async def edit_doctor_put(doctor_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(status_code=400, detail="Invalid doctor ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)

        result = await db.doctors.replace_one(
            {"_id": ObjectId(doctor_id)},
            payload
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
            
        updated = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. PARTIAL UPDATE DOCTOR (PATCH)
@router.patch("/{doctor_id}")
async def update_doctor(doctor_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(status_code=400, detail="Invalid doctor ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        result = await db.doctors.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
            
        updated = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. DELETE DOCTOR
@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(doctor_id: str):
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(status_code=400, detail="Invalid doctor ID format")
            
        result = await db.doctors.delete_one({"_id": ObjectId(doctor_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
            
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))