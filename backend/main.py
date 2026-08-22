from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models

from api.farmers import router as farmer_router
from api.farms import router as farm_router
from api.missions import router as mission_router
from api.video import router as video_router


# ==========================================================
# CREATE DATABASE TABLES
# ==========================================================

models.Base.metadata.create_all(bind=engine)


# ==========================================================
# CREATE FASTAPI APPLICATION
# ==========================================================

app = FastAPI(
    title="AgroGuard AI Backend",
    version="1.0"
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================================
# REGISTER ROUTERS
# ==========================================================

app.include_router(farmer_router)
app.include_router(farm_router)
app.include_router(mission_router)
app.include_router(video_router)


# ==========================================================
# HOME
# ==========================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to AgroGuard AI Backend"
    }