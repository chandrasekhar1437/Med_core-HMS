import os
from motor.motor_asyncio import AsyncIOMotorClient

# Environment Variables extraction with local MongoDB fallbacks
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "med_core_hms")

# Initialize Motor Async Client for MongoDB
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]


# Helper function to get database instance if needed in endpoints
async def get_database():
    return db