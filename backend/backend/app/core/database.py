import os
from dotenv import load_dotenv
import motor.motor_asyncio
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

# ==========================================
# 1. MongoDB Setup (For auth.py, patients.py)
# ==========================================
# Read MONGO_DETAILS directly from .env
MONGO_DETAILS = os.getenv("MONGO_DETAILS")

if not MONGO_DETAILS:
    raise ValueError("MONGO_DETAILS environment variable is missing in .env file!")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client.med_core_hms  # Database instance


# ==========================================
# 2. SQLAlchemy Setup (For billing.py)
# ==========================================
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./sql_app.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get DB session
def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()