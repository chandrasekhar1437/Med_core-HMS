from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.database import db
from app.core.security import get_current_user

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])


class DoctorSchema(BaseModel):
    name: str
    specialization: str
    email: str
    phone: str


def fix_object_ids(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/")
async def get_doctors(
    current_user: str = Depends(get_current_user),
):
    doctors = await db.doctors.find().to_list(100)
    return [fix_object_ids(doc) for doc in doctors]


@router.post("/")
async def create_doctor(
    doctor: DoctorSchema,
    current_user: str = Depends(get_current_user),
):
    doctor_data = doctor.model_dump() if hasattr(doctor, "model_dump") else doctor.dict()
    result = await db.doctors.insert_one(doctor_data)
    doctor_data.pop("_id", None)
    return {"id": str(result.inserted_id), **doctor_data}


@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    current_user: str = Depends(get_current_user),
):
    if not ObjectId.is_valid(doctor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Doctor ID format",
        )

    result = await db.doctors.delete_one({"_id": ObjectId(doctor_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return {"message": "Doctor deleted successfully"}