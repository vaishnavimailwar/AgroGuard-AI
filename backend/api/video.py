from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

import shutil
import os

from services.video_service import (
    process_video
)

from services.mission_service import (
    update_mission_status,
    update_mission_results
)

from database import get_db


router = APIRouter(
    prefix="/video",
    tags=["Video Upload"]
)


# ==========================================================
# UPLOAD DIRECTORY
# ==========================================================

UPLOAD_FOLDER = os.path.join(
    "backend",
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================================
# VIDEO UPLOAD
# ==========================================================

@router.post("/")
async def upload_video(
    mission_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # ======================================================
    # CHECK MISSION
    # ======================================================

    mission = update_mission_status(
        db,
        mission_id,
        "Processing"
    )

    if mission is None:

        raise HTTPException(
            status_code=404,
            detail="Mission not found"
        )

    # ======================================================
    # SAVE VIDEO
    # ======================================================

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # ==================================================
        # PROCESS VIDEO
        # ==================================================

        result = process_video(
            file_path,
            mission_id
        )

        # ==================================================
        # SAVE RESULTS
        # ==================================================

        update_mission_results(
            db,
            mission_id,
            file_path,
            result["detection_file"]
        )

        # ==================================================
        # COMPLETED
        # ==================================================

        update_mission_status(
            db,
            mission_id,
            "Completed"
        )

        return {

            "message":
                "Video Processed Successfully",

            "mission_id":
                mission_id,

            "filename":
                file.filename,

            "path":
                file_path,

            "frames_extracted":
                result["frames"],

            "detections":
                result["detections"],

            "detection_file":
                result["detection_file"],

            "status":
                "Completed"
        }

    except Exception as e:

        update_mission_status(
            db,
            mission_id,
            "Failed"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Video processing failed: "
                f"{str(e)}"
            )
        )


