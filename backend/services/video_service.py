import os

from ai.frame_extractor import extract_frames
from ai.detector import detect_frames

from services.zone_service import analyze_zones
from services.report_service import generate_mission_report


def process_video(video_path, mission_id, crop_type=None, farm=None):

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

    heatmap_folder = os.path.join(
        mission_folder,
        "heatmap"
    )

    reports_folder = os.path.join(
        mission_folder,
        "reports"
    )

    detection_output = os.path.join(
        mission_folder,
        "detection_results.json"
    )

    zone_output = os.path.join(
        heatmap_folder,
        "zone_analysis.json"
    )

    report_output = os.path.join(
        reports_folder,
        f"mission_{mission_id}_report.pdf"
    )

    # -----------------------------------------
    # Create folders
    # -----------------------------------------

    os.makedirs(
        frames_folder,
        exist_ok=True
    )

    os.makedirs(
        heatmap_folder,
        exist_ok=True
    )

    os.makedirs(
        reports_folder,
        exist_ok=True
    )

    # -----------------------------------------
    # 1. Extract frames
    # -----------------------------------------

    frames_result = extract_frames(
        video_path=video_path,
        output_folder=frames_folder,
        frame_interval=None
    )

    # -----------------------------------------
    # 2. Run YOLO detection
    # -----------------------------------------

    detections = detect_frames(
        frames_folder=frames_folder,
        output_file=detection_output
    )

    # -----------------------------------------
    # 3. Analyze spatial risk zones
    # -----------------------------------------

    zone_result = analyze_zones(
        detection_file=detection_output,
        frames_folder=frames_folder,
        output_file=zone_output
    )

    # -----------------------------------------
    # 4. Generate mission PDF report
    # -----------------------------------------

    report_path = generate_mission_report(
        mission_id=mission_id,
        mission_name=f"Mission {mission_id}",
        status="Completed",
        detection_file=detection_output,
        zone_file=zone_output,
        output_file=report_output,
        crop_type=crop_type,
        farm_name=farm.farm_name if farm else None,
        farm_type=farm.farm_type if farm else None,
        season=farm.season if farm else None,
        area=farm.area if farm else None,
        latitude=farm.latitude if farm else None,
        longitude=farm.longitude if farm else None
    )

    # -----------------------------------------
    # 5. Return complete results
    # -----------------------------------------

    return {
        "frames": frames_result,
        "detections": detections,
        "detection_file": detection_output,
        "zone_file": zone_output,
        "zone_analysis": zone_result,
        "report_file": report_path
    }
