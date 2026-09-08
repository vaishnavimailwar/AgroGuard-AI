from fastapi import APIRouter, HTTPException
import bcrypt
import re

import schemas
from mongodb import mongo_db

router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"]
)

farmers_collection = mongo_db["farmers"]


def validate_signup(farmer):
    name = farmer.name.strip()
    mobile = farmer.mobile.strip()
    email = farmer.email.strip().lower()
    village = farmer.village.strip()

    if not re.fullmatch(r"[A-Za-z ]{2,50}", name):
        raise HTTPException(
            status_code=400,
            detail="Name must contain only letters and spaces"
        )

    if not re.fullmatch(r"[6-9]\d{9}", mobile):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid 10-digit Indian mobile number"
        )

    if not re.fullmatch(
        r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$",
        email
    ):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid email address"
        )

    if len(farmer.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    if not village or len(village) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid village name"
        )

    return name, mobile, email, village


@router.post("/signup")
def signup_farmer(farmer: schemas.FarmerCreate):

    name, mobile, email, village = validate_signup(farmer)

    if farmers_collection.find_one({"email": email}):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if farmers_collection.find_one({"mobile": mobile}):
        raise HTTPException(
            status_code=400,
            detail="Mobile number already registered"
        )

    password_hash = bcrypt.hashpw(
        farmer.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    last_farmer = farmers_collection.find_one(
        {},
        sort=[("farmer_id", -1)]
    )

    farmer_id = (
        last_farmer["farmer_id"] + 1
        if last_farmer
        else 1
    )

    farmers_collection.insert_one({
        "farmer_id": farmer_id,
        "name": name,
        "mobile": mobile,
        "email": email,
        "password_hash": password_hash,
        "village": village
    })

    return {
        "message": "Farmer Registered Successfully",
        "farmer_id": farmer_id,
        "name": name,
        "email": email
    }


@router.post("/login")
def login_farmer(credentials: schemas.FarmerLogin):

    email = credentials.email.strip().lower()

    farmer = farmers_collection.find_one({
        "email": email
    })

    if not farmer:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not bcrypt.checkpw(
        credentials.password.encode("utf-8"),
        farmer["password_hash"].encode("utf-8")
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login Successful",
        "farmer_id": farmer["farmer_id"],
        "name": farmer["name"],
        "email": farmer["email"]
    }


@router.get("/")
def get_farmers():

    farmers = list(
        farmers_collection.find(
            {},
            {"password_hash": 0}
        )
    )

    for farmer in farmers:
        farmer["_id"] = str(farmer["_id"])

    return farmers