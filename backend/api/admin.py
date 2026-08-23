import os

from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv


load_dotenv()


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.post("/login")
def admin_login(credentials: dict):

    expected_username = os.getenv("ADMIN_USERNAME")
    expected_password = os.getenv("ADMIN_PASSWORD")

    if not expected_username or not expected_password:
        raise HTTPException(
            status_code=500,
            detail="Admin credentials are not configured"
        )

    if (
        credentials.get("username") != expected_username
        or credentials.get("password") != expected_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials"
        )

    return {
        "message": "Admin login successful",
        "role": "admin"
    }

# ==========================================================
# ADMIN OVERVIEW
# ==========================================================

from pathlib import Path
import json

from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

import models


@router.get("/overview")
def admin_overview(
    db: Session = Depends(get_db)
):

    farmers_count = db.query(
        models.Farmer
    ).count()

    farms_count = db.query(
        models.Farm
    ).count()

    missions = db.query(
        models.Mission
    ).order_by(
        models.Mission.created_at.desc()
    ).all()

    missions_count = len(missions)

    processed_missions = [
        mission
        for mission in missions
        if mission.detection_file
    ]

    detection_frames = 0
    confidence_values = []
    pest_classes = set()

    for mission in processed_missions:

        detection_path = Path(
            mission.detection_file
        )

        if not detection_path.is_absolute():
            detection_path = (
                Path(__file__).resolve().parent.parent
                / detection_path
            )

        if not detection_path.exists():
            continue

        try:

            with open(
                detection_path,
                "r",
                encoding="utf-8"
            ) as file:

                results = json.load(file)

            for frame in results:

                detections = frame.get(
                    "detections",
                    []
                )

                if detections:
                    detection_frames += 1

                for detection in detections:

                    pest_name = detection.get(
                        "class_name"
                    )

                    if pest_name:
                        pest_classes.add(
                            pest_name
                        )

                    confidence = detection.get(
                        "confidence"
                    )

                    if confidence is not None:
                        confidence_values.append(
                            float(confidence)
                        )

        except (
            OSError,
            json.JSONDecodeError,
            TypeError,
            ValueError
        ):
            continue

    average_confidence = None

    if confidence_values:

        average_confidence = round(
            sum(confidence_values)
            / len(confidence_values),
            3
        )

    recent_missions = []

    for mission in missions[:5]:

        recent_missions.append(
            {
                "id": mission.id,
                "name": mission.mission_name,
                "status": mission.status,
                "created_at": (
                    mission.created_at.isoformat()
                    if mission.created_at
                    else None
                ),
                "has_ai_results": bool(
                    mission.detection_file
                )
            }
        )

    return {
        "farmers": farmers_count,
        "farms": farms_count,
        "missions": missions_count,
        "processed_missions": len(
            processed_missions
        ),
        "detection_frames": detection_frames,
        "pest_classes": sorted(
            pest_classes
        ),
        "average_confidence": average_confidence,
        "recent_missions": recent_missions
    }