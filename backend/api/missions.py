from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import os

import schemas
import models

from database import get_db

from services.mission_service import (
    create_mission,
    get_all_missions
)


router = APIRouter(
    prefix="/missions",
    tags=["Missions"]
)


@router.post("/")
def add_mission(
    mission: schemas.MissionCreate,
    db: Session = Depends(get_db)
):
    new_mission = create_mission(
        db,
        mission
    )

    return {
        "message": "Mission Created",
        "id": new_mission.id
    }


@router.get("/")
def get_missions(
    db: Session = Depends(get_db)
):
    return get_all_missions(db)


@router.get("/{mission_id}/results")
def get_mission_results(
    mission_id: int,
    db: Session = Depends(get_db)
):
    # Find mission
    mission = db.query(models.Mission).filter(
        models.Mission.id == mission_id
    ).first()

    if not mission:
        raise HTTPException(
            status_code=404,
            detail="Mission not found"
        )

    # Check detection file
    if not mission.detection_file:
        raise HTTPException(
            status_code=404,
            detail="Detection results not available"
        )

    if not os.path.exists(mission.detection_file):
        raise HTTPException(
            status_code=404,
            detail="Detection file not found"
        )

    # Read detection results
    with open(
        mission.detection_file,
        "r",
        encoding="utf-8"
    ) as file:
        results = json.load(file)

    return {
        "mission_id": mission.id,
        "mission_name": mission.mission_name,
        "status": mission.status,
        "results": results
    }