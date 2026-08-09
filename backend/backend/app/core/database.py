import os
import motor.motor_asyncio
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Safely attempt to load dotenv for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Retrieve MongoDB URI and Database Name with fallback support
MONGO_DETAILS = (
    os.getenv("MONGO_DETAILS")
    or os.getenv("MONGODB_URL")
    or "mongodb://localhost:27017"
)

DB_NAME = (
    os.getenv("DB_NAME")
    or os.getenv("DATABASE_NAME")
    or "med_core_hms"
)

# Initialize Motor AsyncIOMotorClient with a 5-second server selection timeout
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGO_DETAILS,
    serverSelectionTimeoutMS=5000
)

# Active Async MongoDB Instance
db = client[DB_NAME]

# Helper function for endpoint dependency injection if needed
async def get_database():
    return db


# SQLAlchemy relational DB setup (for billing / local SQLite)
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./sql_app.db")
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Session Generator for FastAPI dependency injection
def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()