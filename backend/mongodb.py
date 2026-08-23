import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parent / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "agroguard"
)

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not configured"
    )

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=10000
)

mongo_db = client[MONGODB_DATABASE]
