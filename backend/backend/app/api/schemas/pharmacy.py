from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema for creating a new pharmacy/medicine item
class MedicineCreate(BaseModel):
    medicine_name: str = Field(..., example="Paracetamol 500mg")
    generic_name: str = Field(..., example="Acetaminophen")
    category: str = Field(..., example="Analgesic")
    dosage_form: str = Field(..., example="Tablet")
    manufacturer: str = Field(..., example="PharmaCorp Inc.")
    unit_price: float = Field(..., gt=0, example=5.50)
    stock_quantity: int = Field(..., ge=0, example=250)
    reorder_level: int = Field(default=20, ge=0, example=50)
    expiry_date: str = Field(..., example="2026-12-31")
    batch_number: str = Field(..., example="BATCH-2024-09")

# Schema for partial updates (PATCH)
class MedicineUpdate(BaseModel):
    medicine_name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    dosage_form: Optional[str] = None
    manufacturer: Optional[str] = None
    unit_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    expiry_date: Optional[str] = None
    batch_number: Optional[str] = None

# Schema for full updates (PUT)
class MedicineReplace(MedicineCreate):
    pass

# Response Schema
class MedicineResponse(MedicineCreate):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True