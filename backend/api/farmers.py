from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


import models
import schemas
import bcrypt
from database import get_db


router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"]
)

# =========================================================
# FARMER SIGNUP
# =========================================================

@router.post("/signup")
def signup_farmer(
    farmer: schemas.FarmerCreate,
    db: Session = Depends(get_db)
):

    existing_email = (
        db.query(models.Farmer)
        .filter(models.Farmer.email == farmer.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_mobile = (
        db.query(models.Farmer)
        .filter(models.Farmer.mobile == farmer.mobile)
        .first()
    )

    if existing_mobile:
        raise HTTPException(
            status_code=400,
            detail="Mobile number already registered"
        )

    password_hash = bcrypt.hashpw(
        farmer.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_farmer = models.Farmer(
        name=farmer.name,
        mobile=farmer.mobile,
        email=farmer.email,
        password_hash=password_hash,
        village=farmer.village
    )

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)

    return {
        "message": "Farmer Registered Successfully",
        "farmer_id": new_farmer.id,
        "name": new_farmer.name,
        "email": new_farmer.email
    }

# =========================================================
# FARMER LOGIN
# =========================================================

@router.post("/login")
def login_farmer(
    credentials: schemas.FarmerLogin,
    db: Session = Depends(get_db)
):

    farmer = (
        db.query(models.Farmer)
        .filter(models.Farmer.email == credentials.email)
        .first()
    )


    if not farmer:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    if not farmer.password_hash:
        raise HTTPException(
            status_code=401,
            detail="This farmer account does not have login credentials"
        )


    password_valid = bcrypt.checkpw(
    credentials.password.encode("utf-8"),
    farmer.password_hash.encode("utf-8")
)


    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    return {
        "message": "Login Successful",
        "farmer_id": farmer.id,
        "name": farmer.name,
        "email": farmer.email
    }


# =========================================================
# EXISTING CREATE FARMER
# =========================================================

@router.post("/")
def create_farmer(
    farmer: schemas.FarmerCreate,
    db: Session = Depends(get_db)
):

    existing_email = (
        db.query(models.Farmer)
        .filter(models.Farmer.email == farmer.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_farmer = models.Farmer(
    name=farmer.name,
    mobile=farmer.mobile,
    email=farmer.email,
    password_hash=bcrypt.hashpw(
        farmer.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8"),
    village=farmer.village
)


    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)


    return {
        "message": "Farmer Registered Successfully",
        "id": new_farmer.id
    }


# =========================================================
# GET ALL FARMERS
# =========================================================

@router.get("/")
def get_farmers(
    db: Session = Depends(get_db)
):

    return db.query(
        models.Farmer
    ).all()