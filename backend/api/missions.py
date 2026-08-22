from pathlib import Path
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

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


# ==========================================================
# CREATE MISSION
# ==========================================================

@router.post("/")
def create_new_mission(
    mission: schemas.MissionCreate,
    db: Session = Depends(get_db)
):
    return create_mission(
        db,
        mission
    )


# ==========================================================
# GET ALL MISSIONS
# ==========================================================

@router.get("/")
def get_missions(
    db: Session = Depends(get_db)
):
    return get_all_missions(
        db
    )


# ==========================================================
# GET MISSION RESULTS
# ==========================================================

@router.get("/{mission_id}/results")
def get_mission_results(
    mission_id: int,
    db: Session = Depends(get_db)
):

    # ------------------------------------------------------
    # Find mission
    # ------------------------------------------------------

    mission = (
        db.query(models.Mission)
        .filter(
            models.Mission.id == mission_id
        )
        .first()
    )

    if mission is None:

        raise HTTPException(
            status_code=404,
            detail="Mission not found"
        )

    # ------------------------------------------------------
    # Basic response
    # ------------------------------------------------------

    response = {
        "mission_id": mission.id,
        "mission_name": mission.mission_name,
        "farmer_id": mission.farmer_id,
        "farm_id": mission.farm_id,
        "status": mission.status,
        "video_path": mission.video_path,
        "detection_file": mission.detection_file,
        "results": [],
        "severity": None,
        "spray_advisories": [],
        "zone_analysis": None
    }

    # ======================================================
    # LOAD DETECTION RESULTS
    # ======================================================

    frame_results = []

    if mission.detection_file:

        detection_path = Path(
            mission.detection_file
        )

        if not detection_path.is_absolute():

            detection_path = (
                Path.cwd()
                / detection_path
            )

        if detection_path.exists():

            try:

                with open(
                    detection_path,
                    "r",
                    encoding="utf-8"
                ) as file:

                    detection_data = json.load(file)

            except (
                OSError,
                json.JSONDecodeError
            ):

                detection_data = None

            # --------------------------------------------------
            # Normalize detection format
            # --------------------------------------------------

            if isinstance(
                detection_data,
                list
            ):

                frame_results = detection_data

            elif isinstance(
                detection_data,
                dict
            ):

                frame_results = detection_data.get(
                    "frames",
                    []
                )

            if not isinstance(
                frame_results,
                list
            ):

                frame_results = []

    response[
        "results"
    ] = frame_results

    # ======================================================
    # SEVERITY CALCULATION
    # ======================================================

    total_detections = 0

    confidence_values = []

    pest_counts = {}

    for frame in frame_results:

        if not isinstance(
            frame,
            dict
        ):

            continue

        detections = frame.get(
            "detections",
            []
        )

        if not isinstance(
            detections,
            list
        ):

            continue

        for detection in detections:

            if not isinstance(
                detection,
                dict
            ):

                continue

            total_detections += 1

            try:

                confidence = float(
                    detection.get(
                        "confidence",
                        0.0
                    )
                )

            except (
                TypeError,
                ValueError
            ):

                confidence = 0.0

            confidence_values.append(
                confidence
            )

            pest_name = detection.get(
                "class_name",
                "Unknown"
            )

            pest_counts[
                pest_name
            ] = (
                pest_counts.get(
                    pest_name,
                    0
                ) + 1
            )

    # ------------------------------------------------------
    # Average confidence
    # ------------------------------------------------------

    if confidence_values:

        average_confidence = (
            sum(confidence_values)
            /
            len(confidence_values)
        )

    else:

        average_confidence = 0.0

    # ------------------------------------------------------
    # Severity score
    # ------------------------------------------------------

    severity_score = min(
        100.0,
        (
            total_detections * 10.0
            +
            average_confidence * 50.0
        )
    )

    if severity_score < 30:

        severity_level = "LOW"

    elif severity_score < 60:

        severity_level = "MODERATE"

    else:

        severity_level = "HIGH"

    detected_pests = list(
        pest_counts.keys()
    )

    response[
        "severity"
    ] = {

        "severity_level":
            severity_level,

        "severity_score":
            round(
                severity_score,
                2
            ),

        "total_detections":
            total_detections,

        "average_confidence":
            round(
                average_confidence,
                3
            ),

        "detected_pests":
            detected_pests,

        "pest_counts":
            pest_counts,

        "note":
            (
                "Severity is a detection-based "
                "software risk score. Actual affected "
                "field area requires calibrated "
                "UAV/geospatial data."
            )
    }

    # ======================================================
    # SPRAY ADVISORY
    # ======================================================
    #
    # We intentionally do NOT invent pesticide dose,
    # formulation or active ingredient information.
    #
    # Until crop-specific validated advisory data is
    # available, the system returns a safe fallback.
    # ======================================================

    advisories = []

    for pest_name, pest_count in pest_counts.items():

        advisories.append({

            "pest":
                pest_name,

            "detection_count":
                pest_count,

            "confidence":
                round(
                    average_confidence,
                    3
                ),

            "severity":
                severity_level,

            "crop":
                "Crop-dependent",

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

            "recommendation_class":
                None,

            "economic_threshold":
                None,

            "active_ingredient":
                None,

            "formulation":
                None,

            "dose":
                None,

            "application_method":
                None,

            "source":
                None,

            "evidence_type":
                None
        })

    response[
        "spray_advisories"
    ] = advisories

    # ======================================================
    # LOAD SPATIAL RISK ZONE ANALYSIS
    # ======================================================

    zone_analysis_path = (
        Path.cwd()
        / "uploads"
        / f"mission_{mission_id}"
        / "heatmap"
        / "zone_analysis.json"
    )

    if zone_analysis_path.exists():

        try:

            with open(
                zone_analysis_path,
                "r",
                encoding="utf-8"
            ) as file:

                zone_analysis = json.load(
                    file
                )

            response[
                "zone_analysis"
            ] = zone_analysis

        except (
            OSError,
            json.JSONDecodeError
        ):

            response[
                "zone_analysis"
            ] = None

    # ======================================================
    # RETURN COMPLETE RESULT
    # ======================================================

    return response


# ==========================================================
# DOWNLOAD MISSION REPORT
# ==========================================================

@router.get("/{mission_id}/report")
def download_mission_report(
    mission_id: int,
    db: Session = Depends(get_db)
):

    # ------------------------------------------------------
    # Find mission
    # ------------------------------------------------------

    mission = (
        db.query(models.Mission)
        .filter(
            models.Mission.id == mission_id
        )
        .first()
    )

    if mission is None:

        raise HTTPException(
            status_code=404,
            detail="Mission not found"
        )

    # ------------------------------------------------------
    # PDF generated by report_service.py
    # ------------------------------------------------------

    report_path = (
        Path.cwd()
        / "uploads"
        / f"mission_{mission_id}"
        / "reports"
        / f"mission_{mission_id}_report.pdf"
    )

    # ------------------------------------------------------
    # Make sure PDF exists
    # ------------------------------------------------------

    if not report_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Mission report not found"
        )

    # ------------------------------------------------------
    # Return PDF
    # ------------------------------------------------------

    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=(
            f"mission_{mission_id}_report.pdf"
        )
    )