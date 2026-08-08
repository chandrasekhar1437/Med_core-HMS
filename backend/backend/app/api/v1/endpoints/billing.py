from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId

from app.core.database import db

router = APIRouter(prefix="", tags=["billing"])

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

# 1. GET ALL BILLING RECORDS
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_billings():
    try:
        if db is None:
            return []
        cursor = db.billing.find({})
        billings = await cursor.to_list(length=100)
        return [fix_object_id(b) for b in billings]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. GET BILLING BY ID
@router.get("/{billing_id}")
async def get_billing_by_id(billing_id: str):
    try:
        if not ObjectId.is_valid(billing_id):
            raise HTTPException(status_code=400, detail="Invalid billing ID format")
        
        billing_record = await db.billing.find_one({"_id": ObjectId(billing_id)})
        if not billing_record:
            raise HTTPException(status_code=404, detail="Billing record not found")
            
        return fix_object_id(billing_record)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. CREATE BILLING RECORD (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_billing(payload: Dict[Any, Any]):
    try:
        result = await db.billing.insert_one(payload)
        created = await db.billing.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. EDIT / REPLACE BILLING RECORD (PUT)
@router.put("/{billing_id}")
async def edit_billing_put(billing_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(billing_id):
            raise HTTPException(status_code=400, detail="Invalid billing ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)

        result = await db.billing.replace_one(
            {"_id": ObjectId(billing_id)},
            payload
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Billing record not found")
            
        updated = await db.billing.find_one({"_id": ObjectId(billing_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 5. PARTIAL UPDATE BILLING RECORD (PATCH)
@router.patch("/{billing_id}")
async def update_billing(billing_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(billing_id):
            raise HTTPException(status_code=400, detail="Invalid billing ID format")
        
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        result = await db.billing.update_one(
            {"_id": ObjectId(billing_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Billing record not found")
            
        updated = await db.billing.find_one({"_id": ObjectId(billing_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 6. DELETE BILLING RECORD
@router.delete("/{billing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_billing(billing_id: str):
    try:
        if not ObjectId.is_valid(billing_id):
            raise HTTPException(status_code=400, detail="Invalid billing ID format")
            
        result = await db.billing.delete_one({"_id": ObjectId(billing_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Billing record not found")
            
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))