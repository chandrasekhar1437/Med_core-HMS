from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(
    prefix="/ward-management",
    tags=["ward-management"]
)

# Mock database store
ward_db = [
    {
        "id": "W-101",
        "patient_name": "Rahul Sharma",
        "ward_type": "ICU",
        "bed_number": "ICU-04",
        "admission_date": "2026-08-10",
        "status": "Admitted",
        "vitals": "BP: 130/85 | Temp: 99.1°F | SpO2: 96%"
    }
]

class WardBase(BaseModel):
    patient_name: str
    ward_type: str
    bed_number: str
    admission_date: str
    status: str
    vitals: Optional[str] = ""

@router.get("/", response_model=List[dict])
def get_ward_allocations():
    return ward_db

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_ward_allocation(payload: WardBase):
    new_entry = payload.dict()
    new_entry["id"] = f"W-{len(ward_db) + 101}"
    ward_db.append(new_entry)
    return new_entry

@router.put("/{record_id}")
@router.patch("/{record_id}")
def update_ward_allocation(record_id: str, payload: WardBase):
    for idx, item in enumerate(ward_db):
        if str(item.get("id")) == str(record_id):
            ward_db[idx].update(payload.dict())
            return ward_db[idx]
    # Fallback return for dynamically created records
    return {"id": record_id, **payload.dict()}

@router.delete("/{record_id}")
def delete_ward_allocation(record_id: str):
    global ward_db
    ward_db = [x for x in ward_db if str(x.get("id")) != str(record_id)]
    return {"message": "Ward allocation record deleted successfully"}