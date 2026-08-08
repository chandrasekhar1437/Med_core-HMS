from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from bson import ObjectId

# Import database instance from core
from app.core.database import db

router = APIRouter()


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


# 1. GET ALL MEDICINES
@router.get("/", response_model=List[Dict[Any, Any]])
async def get_medicines():
    """
    Retrieve all medicine records from pharmacy collection.
    """
    try:
        if db is None:
            return []
        cursor = db.pharmacy.find({})
        records = await cursor.to_list(length=100)
        return [fix_object_id(r) for r in records]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# 2. GET MEDICINE BY ID
@router.get("/{medicine_id}")
async def get_medicine_by_id(medicine_id: str):
    """
    Retrieve a specific medicine record by MongoDB ID.
    """
    try:
        if not ObjectId.is_valid(medicine_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid medicine ID format"
            )

        record = await db.pharmacy.find_one({"_id": ObjectId(medicine_id)})
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine record not found"
            )

        return fix_object_id(record)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# 3. CREATE MEDICINE (POST)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_medicine(payload: Dict[Any, Any]):
    """
    Add a new medicine record to the pharmacy collection.
    """
    try:
        result = await db.pharmacy.insert_one(payload)
        created = await db.pharmacy.find_one({"_id": result.inserted_id})
        return fix_object_id(created)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# 4. REPLACE MEDICINE (PUT)
@router.put("/{medicine_id}")
async def edit_medicine_put(medicine_id: str, payload: Dict[Any, Any]):
    """
    Replace an entire medicine record.
    """
    try:
        if not ObjectId.is_valid(medicine_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid medicine ID format"
            )

        payload.pop("id", None)
        payload.pop("_id", None)

        result = await db.pharmacy.replace_one(
            {"_id": ObjectId(medicine_id)},
            payload
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine record not found"
            )

        updated = await db.pharmacy.find_one({"_id": ObjectId(medicine_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# 5. PARTIAL UPDATE MEDICINE (PATCH)
@router.patch("/{medicine_id}")
async def update_medicine(medicine_id: str, payload: Dict[Any, Any]):
    """
    Partially update fields in a medicine record.
    """
    try:
        if not ObjectId.is_valid(medicine_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid medicine ID format"
            )

        payload.pop("id", None)
        payload.pop("_id", None)
        update_data = {k: v for k, v in payload.items() if v is not None}

        result = await db.pharmacy.update_one(
            {"_id": ObjectId(medicine_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine record not found"
            )

        updated = await db.pharmacy.find_one({"_id": ObjectId(medicine_id)})
        return fix_object_id(updated)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# 6. DELETE MEDICINE
@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medicine(medicine_id: str):
    """
    Delete a medicine record from the pharmacy collection.
    """
    try:
        if not ObjectId.is_valid(medicine_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid medicine ID format"
            )

        result = await db.pharmacy.delete_one({"_id": ObjectId(medicine_id)})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine record not found"
            )

        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )