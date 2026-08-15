import os

from ai.frame_extractor import extract_frames
from ai.detector import detect_frames


def process_video(video_path, mission_id):

    # -----------------------------------------
    # Mission-specific folder
    # -----------------------------------------

    mission_folder = os.path.join(
        "uploads",
        f"mission_{mission_id}"
    )

    frames_folder = os.path.join(
        mission_folder,
        "frames"
    )

    detection_output = os.path.join(
        mission_folder,
        "detection_results.json"
    )

    # Create folders
    os.makedirs(
        frames_folder,
        exist_ok=True
    )

    # -----------------------------------------
    # 1. Extract frames
    # -----------------------------------------

    frames_result = extract_frames(
        video_path=video_path,
        output_folder=frames_folder,
        frame_interval=30
    )

    # -----------------------------------------
    # 2. Run YOLO detection
    # -----------------------------------------

    detections = detect_frames(
        frames_folder=frames_folder,
        output_file=detection_output
    )

    # -----------------------------------------
    # 3. Return results
    # -----------------------------------------

    return {
        "frames": frames_result,
        "detections": detections,
        "detection_file": detection_output
    }