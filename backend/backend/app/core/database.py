import os
from dotenv import load_dotenv
import motor.motor_asyncio
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file for local development
load_dotenv()

# ==========================================
# 1. MongoDB Setup (For auth.py, patients.py)
# ==========================================
# Look for MONGO_DETAILS first, fallback to MONGO_URI or DATABASE_URL
MONGO_DETAILS = os.getenv("MONGO_DETAILS") or os.getenv("MONGO_URI") or os.getenv("DATABASE_URL")

# Fallback default connection string if not defined in Render Environment
if not MONGO_DETAILS:
    MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.med_core_hms  # Database instance


# ==========================================
# 2. SQLAlchemy Setup (For billing.py)
# ==========================================
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./sql_app.db")

# Only pass check_same_thread if using SQLite
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get DB session
def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()