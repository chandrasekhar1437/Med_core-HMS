from pydantic import BaseModel
from typing import Optional
from datetime import date

class BillingBase(BaseModel):
    patient_name: str
    doctor_name: Optional[str] = None
    amount: float
    status: Optional[str] = "Pending"
    due_date: Optional[date] = None

class BillingCreate(BillingBase):
    pass

class BillingUpdate(BaseModel):
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    due_date: Optional[date] = None

class BillingResponse(BillingBase):
    id: int

    class Config:
        from_attributes = True