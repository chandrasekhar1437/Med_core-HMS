from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId
from app.core.database import db

# Add the prefix here so the routes match your frontend requests
router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])

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

@router.get("/", response_model=List[Dict[Any, Any]])
async def get_patients():
    try:
        if db is None:
            return []
        patients_cursor = db.patients.find({})
        patients = await patients_cursor.to_list(length=100)
        return [fix_object_id(p) for p in patients]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{patient_id}")
async def get_patient_by_id(patient_id: str):
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient ID format")
        patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return fix_object_id(patient)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_patient(payload: Dict[Any, Any]):
    try:
        result = await db.patients.insert_one(payload)
        created_patient = await db.patients.find_one({"_id": result.inserted_id})
        return fix_object_id(created_patient)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{patient_id}")
async def edit_patient_put(patient_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient ID format")
        payload.pop("id", None)
        payload.pop("_id", None)
        result = await db.patients.replace_one({"_id": ObjectId(patient_id)}, payload)
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        updated_patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
        return fix_object_id(updated_patient)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{patient_id}")
async def update_patient(patient_id: str, payload: Dict[Any, Any]):
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient ID format")
        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}
        result = await db.patients.update_one({"_id": ObjectId(patient_id)}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        updated_patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
        return fix_object_id(updated_patient)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(patient_id: str):
    try:
        if not ObjectId.is_valid(patient_id):
            raise HTTPException(status_code=400, detail="Invalid patient ID format")
        result = await db.patients.delete_one({"_id": ObjectId(patient_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))