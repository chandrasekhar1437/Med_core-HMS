from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.database import db
from app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/records", tags=["Medical Records"])


class RecordSchema(BaseModel):
    patient_id: str
    diagnosis: str
    prescription: str
    notes: str
    doctor_name: Optional[str] = None  # Optional field to manually supply doctor name


def fix_object_ids(doc: dict) -> dict:
    """Safely converts BSON _id into a string key 'id'."""
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/{patient_id}")
async def get_patient_records(
    patient_id: str,
    current_user: str = Depends(get_current_user),
):
    records = await db.records.find({"patient_id": patient_id}).to_list(100)
    return [fix_object_ids(r) for r in records]


@router.post("/")
async def create_record(
    record: RecordSchema,
    current_user: str = Depends(get_current_user),
):
    new_record = record.model_dump() if hasattr(record, "model_dump") else record.dict()
    new_record["created_at"] = datetime.now().isoformat()

    manual_doctor_name = new_record.pop("doctor_name", None)

    # 1. If doctor_name was manually provided in the JSON body, use it directly
    if manual_doctor_name:
        new_record["doctor"] = manual_doctor_name
        new_record["doctor_email"] = current_user
    else:
        # 2. Search doctors collection first, fallback to users collection
        doctor_profile = await db.doctors.find_one({"email": current_user})
        if not doctor_profile:
            doctor_profile = await db.users.find_one({"email": current_user})

        # 3. Safely check for 'name', 'full_name', or 'username' fields
        if doctor_profile:
            doctor_name = (
                doctor_profile.get("name")
                or doctor_profile.get("full_name")
                or doctor_profile.get("username")
            )
            new_record["doctor"] = doctor_name or current_user
            new_record["doctor_email"] = current_user
        else:
            # Fallback to email if no matching profile/name exists
            new_record["doctor"] = current_user

    result = await db.records.insert_one(new_record)

    # Remove raw BSON _id before returning response
    new_record.pop("_id", None)
    return {"id": str(result.inserted_id), **new_record}


@router.delete("/{record_id}")
async def delete_record(
    record_id: str,
    current_user: str = Depends(get_current_user),
):
    if not ObjectId.is_valid(record_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Record ID format",
        )

    result = await db.records.delete_one({"_id": ObjectId(record_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found",
        )
    return {"message": "Record deleted successfully"}