import json
from pathlib import Path

from ai.frame_extractor import extract_frames
from ai.batch_detector import detect_frames


def process_mission_video(
    video_path: str,
    mission_folder: str,
    frame_interval: int = 30
):
    """
    Complete AI processing pipeline for one mission video.

    Video
        ↓
    Frame Extraction
        ↓
    YOLO Detection
        ↓
    Detection JSON
    """

    video_path = Path(video_path)
    mission_folder = Path(mission_folder)

    if not video_path.exists():
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    # --------------------------------------------------
    # 1. Create mission directories
    # --------------------------------------------------

    frames_folder = mission_folder / "frames"
    detections_folder = mission_folder / "detections"

    frames_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    detections_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------
    # 2. Extract video frames
    # --------------------------------------------------

    frame_result = extract_frames(
        video_path=str(video_path),
        output_folder=str(frames_folder),
        frame_interval=frame_interval
    )

    # --------------------------------------------------
    # 3. Run YOLO on extracted frames
    # --------------------------------------------------

    detection_file = (
        detections_folder /
        "detection_results.json"
    )

    detection_result = detect_frames(
        frames_folder=str(frames_folder),
        output_file=str(detection_file)
    )

    # --------------------------------------------------
    # 4. Create mission processing summary
    # --------------------------------------------------

    summary = {
        "video": video_path.name,
        "total_video_frames": frame_result[
            "total_frames"
        ],
        "video_fps": frame_result[
            "fps"
        ],
        "frames_saved": frame_result[
            "frames_saved"
        ],
        "frames_processed": detection_result[
            "total_frames_processed"
        ],
        "detection_file": str(
            detection_file
        )
    }

    summary_file = (
        mission_folder /
        "mission_processing_summary.json"
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