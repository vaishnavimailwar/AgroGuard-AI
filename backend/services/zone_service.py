import json
from pathlib import Path

import cv2


def analyze_zones(
    detection_file: str,
    frames_folder: str,
    output_file: str
):
    """
    Analyze pest detections using a 3x3 image-based risk grid.

    This is a demonstration-stage spatial risk analysis.
    It is NOT a geographic affected-area calculation.
    """

    detection_file = Path(detection_file)
    frames_folder = Path(frames_folder)
    output_file = Path(output_file)

    if not detection_file.exists():
        raise FileNotFoundError(
            f"Detection file not found: {detection_file}"
        )

    if not frames_folder.exists():
        raise FileNotFoundError(
            f"Frames folder not found: {frames_folder}"
        )

    with open(
        detection_file,
        "r",
        encoding="utf-8"
    ) as file:
        detection_results = json.load(file)

    zones = {}

    for row in range(3):
        for column in range(3):

            zone_number = row * 3 + column + 1

            zones[f"zone_{zone_number}"] = {
                "zone": zone_number,
                "row": row + 1,
                "column": column + 1,
                "total_detections": 0,
                "confidence_sum": 0.0,
                "pest_counts": {}
            }

    processed_frames = 0

    for frame_result in detection_results:

        frame_name = frame_result.get(
            "frame"
        )

        if not frame_name:
            continue

        frame_path = frames_folder / frame_name

        if not frame_path.exists():
            continue

        image = cv2.imread(
            str(frame_path)
        )

        if image is None:
            continue

        height, width = image.shape[:2]

        if width <= 0 or height <= 0:
            continue

        processed_frames += 1

        for detection in frame_result.get(
            "detections",
            []
        ):

            bbox = detection.get(
                "bbox",
                {}
            )

            try:
                x1 = float(bbox["x1"])
                y1 = float(bbox["y1"])
                x2 = float(bbox["x2"])
                y2 = float(bbox["y2"])
            except (
                KeyError,
                TypeError,
                ValueError
            ):
                continue

            center_x = (
                x1 + x2
            ) / 2.0

            center_y = (
                y1 + y2
            ) / 2.0

            center_x = max(
                0.0,
                min(center_x, width - 1)
            )

            center_y = max(
                0.0,
                min(center_y, height - 1)
            )

            column = min(
                2,
                int(
                    center_x /
                    (width / 3)
                )
            )

            row = min(
                2,
                int(
                    center_y /
                    (height / 3)
                )
            )

            zone_number = (
                row * 3 +
                column +
                1
            )

            zone_key = (
                f"zone_{zone_number}"
            )

            confidence = float(
                detection.get(
                    "confidence",
                    0.0
                )
            )

            pest_name = detection.get(
                "class_name",
                "Unknown"
            )

            zone = zones[zone_key]

            zone[
                "total_detections"
            ] += 1

            zone[
                "confidence_sum"
            ] += confidence

            zone[
                "pest_counts"
            ][pest_name] = (
                zone[
                    "pest_counts"
                ].get(
                    pest_name,
                    0
                ) + 1
            )

    # --------------------------------------------------
    # Calculate zone risk
    # --------------------------------------------------

    for zone in zones.values():

        total = zone[
            "total_detections"
        ]

        if total == 0:

            zone[
                "average_confidence"
            ] = 0.0

            zone[
                "risk_score"
            ] = 0.0

            zone[
                "risk_level"
            ] = "LOW"

        else:

            average_confidence = (
                zone[
                    "confidence_sum"
                ] / total
            )

            risk_score = min(
                100.0,
                (
                    total * 10.0
                    +
                    average_confidence * 50.0
                )
            )

            if risk_score < 30:

                risk_level = "LOW"

            elif risk_score < 60:

                risk_level = "MODERATE"

            else:

                risk_level = "HIGH"

            zone[
                "average_confidence"
            ] = round(
                average_confidence,
                3
            )

            zone[
                "risk_score"
            ] = round(
                risk_score,
                2
            )

            zone[
                "risk_level"
            ] = risk_level

        del zone[
            "confidence_sum"
        ]

    # --------------------------------------------------
    # Overall summary
    # --------------------------------------------------

    total_detections = sum(
        zone[
            "total_detections"
        ]
        for zone in zones.values()
    )

    high_zones = [
        zone["zone"]
        for zone in zones.values()
        if zone["risk_level"] == "HIGH"
    ]

    moderate_zones = [
        zone["zone"]
        for zone in zones.values()
        if zone["risk_level"] == "MODERATE"
    ]

    low_zones = [
        zone["zone"]
        for zone in zones.values()
        if zone["risk_level"] == "LOW"
    ]

    result = {
        "analysis_type": (
            "image_based_demo_risk_zoning"
        ),
        "grid": "3x3",
        "processed_frames": processed_frames,
        "total_detections": total_detections,
        "zones": list(
            zones.values()
        ),
        "summary": {
            "high_risk_zones": high_zones,
            "moderate_risk_zones": moderate_zones,
            "low_risk_zones": low_zones,
            "high_risk_zone_count": len(
                high_zones
            ),
            "moderate_risk_zone_count": len(
                moderate_zones
            ),
            "low_risk_zone_count": len(
                low_zones
            )
        },
        "note": (
            "This is an image-based demonstration "
            "of pest risk zoning. It does not represent "
            "actual geographic affected field area. "
            "Real geographic zoning requires calibrated "
            "UAV/GPS/geospatial data."
        )
    }

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            indent=4
        )

    return result
