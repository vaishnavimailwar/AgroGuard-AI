from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models

from api.farmers import router as farmer_router
from api.farms import router as farm_router
from api.missions import router as mission_router
from api.video import router as video_router
from api.admin import router as admin_router


# ==========================================================
# Create database tables
# ==========================================================

models.Base.metadata.create_all(bind=engine)


# ==========================================================
# Create FastAPI application
# ==========================================================

app = FastAPI(
    title="AgroGuard AI Backend",
    version="1.0"
)


# ==========================================================
# CORS CONFIGURATION
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://agroguard-ai-two.vercel.app",
    ],
    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================================
# Register API Routers
# ==========================================================

app.include_router(farmer_router)
app.include_router(farm_router)
app.include_router(mission_router)
app.include_router(video_router)
app.include_router(admin_router)


# ==========================================================
# Home Route
# ==========================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to AgroGuard AI Backend 🚁🌾"
    }
