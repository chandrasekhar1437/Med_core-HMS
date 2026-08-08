from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId

from app.core.database import db

router = APIRouter(prefix="", tags=["prescriptions"])

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

# 1. GET ALL PRESCRIPTIONS
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_prescriptions():
    try:
        if db is None:
            return []
        cursor = db.prescriptions.find({})
        records = await cursor.to_list(length=100)
        return [fix_object_id(r) for r in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. GET PRESCRIPTION BY ID
@router.get("/{prescription_id}")
async def get_prescription_by_id(prescription_id: str):
    try:
        if not ObjectId.is_valid(prescription_id):
            raise HTTPException(status_code=400, detail="Invalid prescription ID format")
        
        record = await db.prescriptions.find_one({"_id": ObjectId(prescription_id)})
        if not record:
            raise HTTPException(status_code=404, detail="Prescription not found")
            
        return fix_object_id(record)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. CREATE PRESCRIPTION (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_prescription(payload: Dict[Any, Any]):
    try:
        result = await db.prescriptions.insert_one(payload)
        created = await db.prescriptions.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. EDIT / REPLACE PRESCRIPTION (PUT)
@router.put("/{prescription_id}")
async def edit_prescription_put(prescription_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(prescription_id):
            raise HTTPException(status_code=400, detail="Invalid prescription ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)

        result = await db.prescriptions.replace_one(
            {"_id": ObjectId(prescription_id)},
            payload
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
            
        updated = await db.prescriptions.find_one({"_id": ObjectId(prescription_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. PARTIAL UPDATE PRESCRIPTION (PATCH)
@router.patch("/{prescription_id}")
async def update_prescription(prescription_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(prescription_id):
            raise HTTPException(status_code=400, detail="Invalid prescription ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        result = await db.prescriptions.update_one(
            {"_id": ObjectId(prescription_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
            
        updated = await db.prescriptions.find_one({"_id": ObjectId(prescription_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. DELETE PRESCRIPTION
@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prescription(prescription_id: str):
    try:
        if not ObjectId.is_valid(prescription_id):
            raise HTTPException(status_code=400, detail="Invalid prescription ID format")
            
        result = await db.prescriptions.delete_one({"_id": ObjectId(prescription_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
            
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))