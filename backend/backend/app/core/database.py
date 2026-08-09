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

# Retrieve variables from environment
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "med_core_hms")

# Initialize Motor Client with explicit TLS flags for Linux containers
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGO_DETAILS,
    tls=True,
    tlsAllowInvalidCertificates=True
)

db = client[DB_NAME]

# SQLAlchemy setup (billing)
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./sql_app.db")
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()