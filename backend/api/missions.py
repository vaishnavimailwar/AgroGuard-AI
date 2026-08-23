from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import json
import os
from pathlib import Path

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

from services.spray_advisory_service import (
    generate_spray_advisory
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

    farmer = db.query(models.Farmer).filter(
        models.Farmer.id == mission.farmer_id
    ).first()

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farm = db.query(models.Farm).filter(
        models.Farm.id == mission.farm_id,
        models.Farm.farmer_id == mission.farmer_id
    ).first()

    if not farm:
        raise HTTPException(
            status_code=400,
            detail="Selected farm does not belong to this farmer"
        )

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

    farm = db.query(models.Farm).filter(
        models.Farm.id == mission.farm_id
    ).first()
    crop_type = farm.crop_type if farm else None

    spray_advisories = []

    for pest_name, pest_count in pest_counts.items():

        advisory = generate_spray_advisory(
            pest=pest_name,
            confidence=average_confidence,
            severity=severity_level,
            crop=crop_type
        )
        advisory["detection_count"] = pest_count
        spray_advisories.append(advisory)
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
        "farm": {
            "id": farm.id,
            "farm_name": farm.farm_name,
            "crop_type": farm.crop_type,
            "farm_type": farm.farm_type,
            "season": farm.season,
            "area": farm.area,
            "latitude": farm.latitude,
            "longitude": farm.longitude
        } if farm else None,

        # Existing detection results
        "results": results,

        # Existing severity analysis
        "severity": severity,

        # Image-based risk zone analysis
         "zones": zones,

        # Safe agricultural advisory guidance
        "spray_advisories": spray_advisories
    }


@router.get("/{mission_id}/report")
def get_mission_report(
    mission_id: int,
    farmer_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(models.Mission).filter(
        models.Mission.id == mission_id
    ).first()

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.farmer_id != farmer_id:
        raise HTTPException(status_code=403, detail="Mission does not belong to this farmer")

    report_path = (
        Path(__file__).resolve().parents[1]
        / "uploads"
        / f"mission_{mission_id}"
        / "reports"
        / f"mission_{mission_id}_report.pdf"
    )

    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Mission report not available")

    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=f"agroguard_inspection_{mission_id}.pdf"
    )

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