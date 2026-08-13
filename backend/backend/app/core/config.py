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
    
    # Environment Variables
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_to_a_secure_random_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Check MONGO_DETAILS, MONGODB_URL, or DATABASE_URL
    MONGO_DETAILS: str = (
        os.getenv("MONGO_DETAILS")
        or os.getenv("MONGODB_URL")
        or os.getenv("DATABASE_URL")
        or "mongodb://localhost:27017"
    )
    DB_NAME: str = os.getenv("DB_NAME", os.getenv("DATABASE_NAME", "med_core_hms"))

settings = Settings()

MAIL_USERNAME=your_system_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_system_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com