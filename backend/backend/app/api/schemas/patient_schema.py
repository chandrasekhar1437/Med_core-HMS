from pydantic import BaseModel, Field
from typing import Optional

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    address: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None

class PatientResponse(PatientBase):
    id: str = Field(..., alias="id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True