from sqlalchemy import Column, Integer, String, Float, Date
from app.core.database import Base # Adjust import based on your database base path

class Billing(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Pending")
    due_date = Column(Date, nullable=True)