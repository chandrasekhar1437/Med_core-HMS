from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId

from app.core.database import db

router = APIRouter(prefix="", tags=["medical_records"])

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

# 1. GET ALL MEDICAL RECORDS
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_medical_records():
    try:
        if db is None:
            return []
        cursor = db.medical_records.find({})
        records = await cursor.to_list(length=100)
        return [fix_object_id(r) for r in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. GET MEDICAL RECORD BY ID
@router.get("/{record_id}")
async def get_medical_record_by_id(record_id: str):
    try:
        if not ObjectId.is_valid(record_id):
            raise HTTPException(status_code=400, detail="Invalid record ID format")
        
        record = await db.medical_records.find_one({"_id": ObjectId(record_id)})
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
            
        return fix_object_id(record)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. CREATE MEDICAL RECORD (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_medical_record(payload: Dict[Any, Any]):
    try:
        result = await db.medical_records.insert_one(payload)
        created = await db.medical_records.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. EDIT / REPLACE MEDICAL RECORD (PUT)
@router.put("/{record_id}")
async def edit_medical_record_put(record_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(record_id):
            raise HTTPException(status_code=400, detail="Invalid record ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)

        result = await db.medical_records.replace_one(
            {"_id": ObjectId(record_id)},
            payload
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Medical record not found")
            
        updated = await db.medical_records.find_one({"_id": ObjectId(record_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. PARTIAL UPDATE MEDICAL RECORD (PATCH)
@router.patch("/{record_id}")
async def update_medical_record(record_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(record_id):
            raise HTTPException(status_code=400, detail="Invalid record ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        result = await db.medical_records.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Medical record not found")
            
        updated = await db.medical_records.find_one({"_id": ObjectId(record_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. DELETE MEDICAL RECORD
@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medical_record(record_id: str):
    try:
        if not ObjectId.is_valid(record_id):
            raise HTTPException(status_code=400, detail="Invalid record ID format")
            
        result = await db.medical_records.delete_one({"_id": ObjectId(record_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Medical record not found")
            
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))