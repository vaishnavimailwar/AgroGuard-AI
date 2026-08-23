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
import models

from services.video_service import process_video
from services.mission_service import (
    update_mission_status,
    update_mission_results
)

from database import get_db


router = APIRouter(
    prefix="/video",
    tags=["Video Upload"]
)


UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


@router.post("/")
async def upload_video(
    mission_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # 1. Check mission exists
    # -----------------------------------------

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

    # -----------------------------------------
    # 2. Save uploaded video
    # -----------------------------------------

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    try:

        # -----------------------------------------
        # 3. Process video
        # -----------------------------------------

        farm = db.query(models.Farm).filter(
            models.Farm.id == mission.farm_id
        ).first()

        result = process_video(
            file_path,
            mission_id,
            farm.crop_type if farm else None,
            farm
        )

        # -----------------------------------------
        # 4. Save mission results in database
        # -----------------------------------------

        update_mission_results(
            db,
            mission_id,
            file_path,
            result["detection_file"]
        )

        # -----------------------------------------
        # 5. Mark mission completed
        # -----------------------------------------

        update_mission_status(
            db,
            mission_id,
            "Completed"
        )

        # -----------------------------------------
        # 6. Return response
        # -----------------------------------------

        return {
            "message": "Video Processed Successfully",
            "mission_id": mission_id,
            "filename": file.filename,
            "path": file_path,
            "frames_extracted": result["frames"],
            "detections": result["detections"],
            "detection_file": result["detection_file"],
            "status": "Completed"
        }

    except Exception as e:

        # -----------------------------------------
        # Processing failed
        # -----------------------------------------

        update_mission_status(
            db,
            mission_id,
            "Failed"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Video processing failed: {str(e)}"
        )