from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas
import models
from database import get_db
from services.farm_service import (
    create_farm,
    get_all_farms,
    get_farmer_farms
)

router = APIRouter(
    prefix="/farms",
    tags=["Farms"]
)

@router.post("/")
def add_farm(
    farm: schemas.FarmCreate,
    db: Session = Depends(get_db)
):

    new_farm = create_farm(db, farm)

    return {
        "message": "Farm Added Successfully",
        "id": new_farm.id
    }


@router.get("/")
def list_farms(
    db: Session = Depends(get_db)
):

    return get_all_farms(db)


@router.get("/farmer/{farmer_id}")
def list_farmer_farms(
    farmer_id: int,
    db: Session = Depends(get_db)
):

    return get_farmer_farms(db, farmer_id)