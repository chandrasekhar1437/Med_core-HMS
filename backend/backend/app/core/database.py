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

# Client & Database holders for lazy loading
_client = None
_db = None

def get_mongo_url() -> str:
    return (
        os.getenv("MONGO_DETAILS")
        or os.getenv("MONGODB_URL")
        or os.getenv("DATABASE_URL")
        or "mongodb://localhost:27017"
    )

def get_db_name() -> str:
    return os.getenv("DB_NAME") or os.getenv("DATABASE_NAME") or "med_core_hms"

def get_mongo_client():
    global _client
    if _client is None:
        mongo_url = get_mongo_url()
        is_atlas = "mongodb+srv" in mongo_url or "ssl=true" in mongo_url.lower()

        client_kwargs = {
            "serverSelectionTimeoutMS": 5000,
        }
        if is_atlas:
            client_kwargs["tls"] = True
            client_kwargs["tlsAllowInvalidCertificates"] = True

        _client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url, **client_kwargs)
    return _client

class LazyDatabase:
    """Wrapper that dynamically delegates collection access to active Motor DB."""
    def __getattr__(self, name):
        global _db
        if _db is None:
            client = get_mongo_client()
            _db = client[get_db_name()]
        return getattr(_db, name)

    def __getitem__(self, name):
        global _db
        if _db is None:
            client = get_mongo_client()
            _db = client[get_db_name()]
        return _db[name]

# Active MongoDB instance export
db = LazyDatabase()

async def get_database():
    return db


# SQLAlchemy relational DB setup (for billing / local SQLite)
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