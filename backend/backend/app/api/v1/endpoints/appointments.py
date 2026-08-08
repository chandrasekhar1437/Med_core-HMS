from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId

from app.core.database import db

router = APIRouter(prefix="", tags=["appointments"])

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

# 1. GET ALL APPOINTMENTS
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_appointments():
    try:
        if db is None:
            return []
        cursor = db.appointments.find({})
        appointments = await cursor.to_list(length=100)
        return [fix_object_id(a) for a in appointments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. GET APPOINTMENT BY ID
@router.get("/{appointment_id}")
async def get_appointment_by_id(appointment_id: str):
    try:
        if not ObjectId.is_valid(appointment_id):
            raise HTTPException(status_code=400, detail="Invalid appointment ID format")
        
        appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        return fix_object_id(appointment)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. CREATE APPOINTMENT (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_appointment(payload: Dict[Any, Any]):
    try:
        result = await db.appointments.insert_one(payload)
        created = await db.appointments.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. EDIT / REPLACE APPOINTMENT (PUT)
@router.put("/{appointment_id}")
async def edit_appointment_put(appointment_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(appointment_id):
            raise HTTPException(status_code=400, detail="Invalid appointment ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)

        result = await db.appointments.replace_one(
            {"_id": ObjectId(appointment_id)},
            payload
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        updated = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. PARTIAL UPDATE APPOINTMENT (PATCH)
@router.patch("/{appointment_id}")
async def update_appointment(appointment_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(appointment_id):
            raise HTTPException(status_code=400, detail="Invalid appointment ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        result = await db.appointments.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        updated = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. DELETE APPOINTMENT
@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(appointment_id: str):
    try:
        if not ObjectId.is_valid(appointment_id):
            raise HTTPException(status_code=400, detail="Invalid appointment ID format")
            
        result = await db.appointments.delete_one({"_id": ObjectId(appointment_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))