# Environment variables (Pydantic Settings)
import os
from pydantic_settings import BaseSettings

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings(BaseSettings):
    PROJECT_NAME: str = "Med-core HMS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment Variables from Render
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_to_a_secure_random_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    MONGO_DETAILS: str = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "med_core_hms")

settings = Settings()