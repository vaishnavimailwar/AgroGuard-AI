import os


def create_mission_folder(mission_id: int):

    base_path = "uploads"

    mission_path = os.path.join(
        base_path,
        f"mission_{mission_id}"
    )

    frames_path = os.path.join(
        mission_path,
        "frames"
    )

    detections_path = os.path.join(
        mission_path,
        "detections"
    )

    reports_path = os.path.join(
        mission_path,
        "reports"
    )

    heatmap_path = os.path.join(
        mission_path,
        "heatmap"
    )

    os.makedirs(frames_path, exist_ok=True)

    os.makedirs(detections_path, exist_ok=True)

    os.makedirs(reports_path, exist_ok=True)

    os.makedirs(heatmap_path, exist_ok=True)

    return mission_path