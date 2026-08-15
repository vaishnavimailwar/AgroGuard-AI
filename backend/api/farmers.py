from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"]
)

# Create Farmer
@router.post("/")
def create_farmer(
    farmer: schemas.FarmerCreate,
    db: Session = Depends(get_db)
):
    new_farmer = models.Farmer(
        name=farmer.name,
        mobile=farmer.mobile,
        village=farmer.village
    )

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)

    return {
        "message": "Farmer Registered Successfully",
        "id": new_farmer.id
    }

# Get All Farmers
@router.get("/")
def get_farmers(db: Session = Depends(get_db)):
    return db.query(models.Farmer).all()