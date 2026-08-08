import motor.motor_asyncio
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ==========================================
# 1. MongoDB Setup (For auth.py, patients.py)
# ==========================================
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.med_core_hms  # This provides the 'db' import


# ==========================================
# 2. SQLAlchemy Setup (For billing.py)
# ==========================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# This provides the 'get_db' import
def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()