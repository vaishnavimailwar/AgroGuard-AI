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

from services.severity_services import (
    calculate_severity
)


router = APIRouter(
    prefix="/missions",
    tags=["Missions"]
)


# ==========================================================
# CREATE MISSION
# ==========================================================

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


# ==========================================================
# GET ALL MISSIONS
# ==========================================================

@router.get("/")
def get_missions(
    db: Session = Depends(get_db)
):

    return get_all_missions(db)


# ==========================================================
# GET MISSION RESULTS
# ==========================================================

@router.get("/{mission_id}/results")
def get_mission_results(
    mission_id: int,
    db: Session = Depends(get_db)
):

    # ------------------------------------------------------
    # 1. Find mission
    # ------------------------------------------------------

    mission = db.query(
        models.Mission
    ).filter(
        models.Mission.id == mission_id
    ).first()

    if not mission:

        raise HTTPException(
            status_code=404,
            detail="Mission not found"
        )

    # ------------------------------------------------------
    # 2. Check detection file
    # ------------------------------------------------------

    if not mission.detection_file:

        raise HTTPException(
            status_code=404,
            detail="Detection results not available"
        )

    # ------------------------------------------------------
    # 3. Check detection file exists
    # ------------------------------------------------------

    if not os.path.exists(
        mission.detection_file
    ):

        raise HTTPException(
            status_code=404,
            detail="Detection file not found"
        )

    # ------------------------------------------------------
    # 4. Read detection results
    # ------------------------------------------------------

    with open(
        mission.detection_file,
        "r",
        encoding="utf-8"
    ) as file:

        results = json.load(file)

    # ------------------------------------------------------
    # 5. Calculate severity
    # ------------------------------------------------------

    severity = calculate_severity(
        results
    )
    # ------------------------------------------------------
    # 5A. Generate safe spray advisory guidance
    # ------------------------------------------------------

    pest_counts = {}
    confidence_values = []

    for frame in results:

        for detection in frame.get(
            "detections",
            []
        ):

            pest_name = detection.get(
                "class_name",
                "Unknown"
            )

            pest_counts[pest_name] = (
                pest_counts.get(
                    pest_name,
                    0
                ) + 1
            )

            confidence = detection.get(
                "confidence"
            )

            if confidence is not None:
                confidence_values.append(
                    float(confidence)
                )

        average_confidence = (
        sum(confidence_values) /
        len(confidence_values)
        if confidence_values
        else 0.0
    )

    if isinstance(severity, dict):

        severity_level = (
            severity.get("severity_level")
            or severity.get("severity")
            or severity.get("level")
            or "Calculated"
        )

    else:

        severity_level = str(
            severity
        )

    spray_advisories = []

    for pest_name, pest_count in pest_counts.items():

        spray_advisories.append({

            "pest": pest_name,

            "detection_count": pest_count,

            "confidence": round(
                average_confidence,
                3
            ),

            "severity": severity_level,

            "crop": "Crop-dependent",

            "advisory_status":
                "No crop-specific advisory record found",

            "monitoring":
                (
                    "Inspect affected plants and nearby "
                    "plants for continued pest activity."
                ),

            "action":
                (
                    "Continue monitoring and use validated "
                    "integrated pest management practices."
                ),

            "intervention":
                (
                    "Consult a qualified agricultural "
                    "extension recommendation before "
                    "selecting any pesticide."
                ),

            "recommendation_class": None,

            "economic_threshold": None,

            "active_ingredient": None,

            "formulation": None,

            "dose": None,

            "application_method": None,

            "source": None,

            "evidence_type": None
        })
    # ------------------------------------------------------
    # 6. Locate zone analysis
    # ------------------------------------------------------

    detection_path = os.path.abspath(
        mission.detection_file
    )

    mission_folder = os.path.dirname(
        detection_path
    )

    zone_file = os.path.join(
        mission_folder,
        "heatmap",
        "zone_analysis.json"
    )

    zones = None

    # ------------------------------------------------------
    # 7. Read zone analysis when available
    # ------------------------------------------------------

    if os.path.exists(zone_file):

        with open(
            zone_file,
            "r",
            encoding="utf-8"
        ) as file:

            zones = json.load(file)

    # ------------------------------------------------------
    # 8. Return mission results
    # ------------------------------------------------------

    return {
        "mission_id": mission.id,
        "mission_name": mission.mission_name,
        "status": mission.status,

        # Existing detection results
        "results": results,

        # Existing severity analysis
        "severity": severity,

        # Image-based risk zone analysis
         "zones": zones,

        # Safe agricultural advisory guidance
        "spray_advisories": spray_advisories
    }

# ==========================================================
# GET MISSIONS FOR A FARMER
# ==========================================================

@router.get("/farmer/{farmer_id}")
def get_farmer_missions(
    farmer_id: int,
    db: Session = Depends(get_db)
):

    return db.query(
        models.Mission
    ).filter(
        models.Mission.farmer_id == farmer_id
    ).all()