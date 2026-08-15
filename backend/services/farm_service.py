from sqlalchemy.orm import Session
import models

def create_farm(db: Session, farm):

    new_farm = models.Farm(
        farm_name=farm.farm_name,
        crop_type=farm.crop_type,
        area=farm.area,
        latitude=farm.latitude,
        longitude=farm.longitude,
        farmer_id=farm.farmer_id
    )

    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)

    return new_farm


def get_all_farms(db: Session):
    return db.query(models.Farm).all()