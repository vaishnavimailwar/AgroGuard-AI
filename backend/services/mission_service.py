import json
from pathlib import Path

from sqlalchemy.orm import Session

import models

from ai.frame_extractor import extract_frames
from ai.batch_detector import detect_frames


def create_mission(
    db: Session,
    mission_data
):
    mission = models.Mission(
        mission_name=mission_data.mission_name,
        farmer_id=mission_data.farmer_id,
        farm_id=mission_data.farm_id,
        status="Pending"
    )

    db.add(mission)
    db.commit()
    db.refresh(mission)

    return mission


def get_all_missions(
    db: Session
):
    return (
        db.query(models.Mission)
        .order_by(models.Mission.created_at.desc())
        .all()
    )


def process_mission_video(
    video_path: str,
    mission_folder: str,
    frame_interval: int = 30
):

    """
    Complete AI processing pipeline.

    Video
        ↓
    Frame Extraction
        ↓
    YOLO Detection
        ↓
    Detection JSON
    """

    video_path = Path(
        video_path
    )

    mission_folder = Path(
        mission_folder
    )

    if not video_path.exists():

        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    # ======================================================
    # CREATE DIRECTORIES
    # ======================================================

    frames_folder = (
        mission_folder
        / "frames"
    )

    detections_folder = (
        mission_folder
        / "detections"
    )

    frames_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    detections_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    # ======================================================
    # EXTRACT FRAMES
    # ======================================================

    frame_result = extract_frames(
        video_path=str(
            video_path
        ),

        output_folder=str(
            frames_folder
        ),

        frame_interval=frame_interval
    )

    # ======================================================
    # RUN YOLO
    # ======================================================

    detection_file = (
        detections_folder
        / "detection_results.json"
    )

    detection_result = detect_frames(
        frames_folder=str(
            frames_folder
        ),

        output_file=str(
            detection_file
        )
    )

    # ======================================================
    # CREATE SUMMARY
    # ======================================================

    summary = {

        "video": video_path.name,

        "total_video_frames":
            frame_result[
                "total_frames"
            ],

        "video_fps":
            frame_result[
                "fps"
            ],

        "frames_saved":
            frame_result[
                "frames_saved"
            ],

        "frames_processed":
            detection_result[
                "total_frames_processed"
            ],

        "detection_file":
            str(
                detection_file
            )
    }

    summary_file = (
        mission_folder
        / "mission_processing_summary.json"
    )

    with open(
        summary_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            summary,
            file,
            indent=4
        )

    return summary

def update_mission_status(
    db: Session,
    mission_id: int,
    status: str
):
    mission = (
        db.query(models.Mission)
        .filter(models.Mission.id == mission_id)
        .first()
    )

    if mission is None:
        return None

    mission.status = status

    db.commit()
    db.refresh(mission)

    return mission


def update_mission_results(
    db: Session,
    mission_id: int,
    video_path: str,
    detection_file: str
):
    mission = (
        db.query(models.Mission)
        .filter(models.Mission.id == mission_id)
        .first()
    )

    if mission is None:
        return None

    mission.video_path = video_path
    mission.detection_file = detection_file

    db.commit()
    db.refresh(mission)

    return mission
