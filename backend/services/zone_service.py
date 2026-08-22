import json
from pathlib import Path

import cv2


def analyze_zones(
    detection_file: str,
    frames_folder: str,
    output_file: str
):
    """
    Analyze pest detections using a 3x3 image-based
    spatial risk grid.

    This is a demonstration-stage spatial analysis.
    It does NOT represent real geographic field area.

    Expected detection JSON format:

    {
        "total_frames_processed": 10,
        "frames": [
            {
                "frame": "frame_00000.jpg",
                "detections": [
                    {
                        "class_id": 0,
                        "class_name": "pest_name",
                        "confidence": 0.85,
                        "bbox": {
                            "x1": 100,
                            "y1": 100,
                            "x2": 200,
                            "y2": 200
                        }
                    }
                ]
            }
        ]
    }
    """

    # ==========================================================
    # CONVERT PATHS
    # ==========================================================

    detection_file = Path(detection_file)
    frames_folder = Path(frames_folder)
    output_file = Path(output_file)

    # ==========================================================
    # CHECK INPUT FILES
    # ==========================================================

    if not detection_file.exists():
        raise FileNotFoundError(
            f"Detection file not found: {detection_file}"
        )

    if not frames_folder.exists():
        raise FileNotFoundError(
            f"Frames folder not found: {frames_folder}"
        )

    # ==========================================================
    # LOAD DETECTION JSON
    # ==========================================================

    with open(
        detection_file,
        "r",
        encoding="utf-8"
    ) as file:
        detection_data = json.load(file)

    # ==========================================================
    # NORMALIZE DETECTION RESULTS
    # ==========================================================

    # detect_frames() returns:
    #
    # {
    #     "total_frames_processed": ...,
    #     "frames": [...]
    # }
    #
    # Older versions may return the frames list directly.
    # Handle both safely.

    if isinstance(detection_data, dict):

        detection_results = detection_data.get(
            "frames",
            []
        )

    elif isinstance(detection_data, list):

        detection_results = detection_data

    else:

        raise ValueError(
            "Invalid detection results format."
        )

    # ==========================================================
    # CREATE 3x3 ZONES
    # ==========================================================

    zones = {}

    for row in range(3):

        for column in range(3):

            zone_number = (
                row * 3
                + column
                + 1
            )

            zones[
                f"zone_{zone_number}"
            ] = {

                "zone":
                    zone_number,

                "row":
                    row + 1,

                "column":
                    column + 1,

                "total_detections":
                    0,

                "confidence_sum":
                    0.0,

                "pest_counts":
                    {}
            }

    # ==========================================================
    # PROCESS FRAMES
    # ==========================================================

    processed_frames = 0

    for frame_result in detection_results:

        if not isinstance(
            frame_result,
            dict
        ):
            continue

        frame_name = frame_result.get(
            "frame"
        )

        if not frame_name:
            continue

        frame_path = (
            frames_folder
            / frame_name
        )

        if not frame_path.exists():
            continue

        # ------------------------------------------------------
        # READ IMAGE
        # ------------------------------------------------------

        image = cv2.imread(
            str(frame_path)
        )

        if image is None:
            continue

        height, width = image.shape[:2]

        if width <= 0 or height <= 0:
            continue

        processed_frames += 1

        # ------------------------------------------------------
        # GET DETECTIONS
        # ------------------------------------------------------

        detections = frame_result.get(
            "detections",
            []
        )

        if not isinstance(
            detections,
            list
        ):
            continue

        # ------------------------------------------------------
        # PROCESS EACH DETECTION
        # ------------------------------------------------------

        for detection in detections:

            if not isinstance(
                detection,
                dict
            ):
                continue

            # --------------------------------------------------
            # GET BOUNDING BOX
            # --------------------------------------------------

            bbox = detection.get(
                "bbox",
                {}
            )

            # --------------------------------------------------
            # Support dictionary bbox
            # --------------------------------------------------

            if isinstance(
                bbox,
                dict
            ):

                try:

                    x1 = float(
                        bbox.get(
                            "x1",
                            0
                        )
                    )

                    y1 = float(
                        bbox.get(
                            "y1",
                            0
                        )
                    )

                    x2 = float(
                        bbox.get(
                            "x2",
                            0
                        )
                    )

                    y2 = float(
                        bbox.get(
                            "y2",
                            0
                        )
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    continue

            # --------------------------------------------------
            # Support list bbox
            # --------------------------------------------------

            elif isinstance(
                bbox,
                (list, tuple)
            ) and len(bbox) >= 4:

                try:

                    x1 = float(
                        bbox[0]
                    )

                    y1 = float(
                        bbox[1]
                    )

                    x2 = float(
                        bbox[2]
                    )

                    y2 = float(
                        bbox[3]
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    continue

            else:

                continue

            # --------------------------------------------------
            # CALCULATE BOUNDING BOX CENTER
            # --------------------------------------------------

            center_x = (
                x1 + x2
            ) / 2.0

            center_y = (
                y1 + y2
            ) / 2.0

            # --------------------------------------------------
            # KEEP CENTER INSIDE IMAGE
            # --------------------------------------------------

            center_x = max(
                0.0,
                min(
                    center_x,
                    width - 1
                )
            )

            center_y = max(
                0.0,
                min(
                    center_y,
                    height - 1
                )
            )

            # --------------------------------------------------
            # DETERMINE COLUMN
            # --------------------------------------------------

            column = min(
                2,
                int(
                    center_x
                    / (width / 3.0)
                )
            )

            # --------------------------------------------------
            # DETERMINE ROW
            # --------------------------------------------------

            row = min(
                2,
                int(
                    center_y
                    / (height / 3.0)
                )
            )

            # --------------------------------------------------
            # CALCULATE ZONE NUMBER
            # --------------------------------------------------

            zone_number = (
                row * 3
                + column
                + 1
            )

            zone_key = (
                f"zone_{zone_number}"
            )

            # --------------------------------------------------
            # CONFIDENCE
            # --------------------------------------------------

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

            # --------------------------------------------------
            # PEST NAME
            # --------------------------------------------------

            pest_name = (
                detection.get(
                    "class_name"
                )
                or detection.get(
                    "pest"
                )
                or "Unknown"
            )

            # --------------------------------------------------
            # UPDATE ZONE
            # --------------------------------------------------

            zone = zones[
                zone_key
            ]

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

    # ==========================================================
    # CALCULATE ZONE RISK
    # ==========================================================

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
                ]
                / total
            )

            # --------------------------------------------------
            # DEMO-STAGE RISK SCORE
            # --------------------------------------------------

            risk_score = min(
                100.0,
                (
                    total * 10.0
                    +
                    average_confidence * 50.0
                )
            )

            # --------------------------------------------------
            # RISK CLASSIFICATION
            # --------------------------------------------------

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

        # ------------------------------------------------------
        # REMOVE INTERNAL CALCULATION FIELD
        # ------------------------------------------------------

        del zone[
            "confidence_sum"
        ]

    # ==========================================================
    # OVERALL SUMMARY
    # ==========================================================

    total_detections = sum(
        zone[
            "total_detections"
        ]
        for zone in zones.values()
    )

    high_zones = [
        zone["zone"]
        for zone in zones.values()
        if zone[
            "risk_level"
        ] == "HIGH"
    ]

    moderate_zones = [
        zone["zone"]
        for zone in zones.values()
        if zone[
            "risk_level"
        ] == "MODERATE"
    ]

    low_zones = [
        zone["zone"]
        for zone in zones.values()
        if zone[
            "risk_level"
        ] == "LOW"
    ]

    # ==========================================================
    # FINAL RESULT
    # ==========================================================

    result = {

        "analysis_type":
            "image_based_demo_risk_zoning",

        "grid":
            "3x3",

        "processed_frames":
            processed_frames,

        "total_detections":
            total_detections,

        "zones":
            list(
                zones.values()
            ),

        "summary": {

            "high_risk_zones":
                high_zones,

            "moderate_risk_zones":
                moderate_zones,

            "low_risk_zones":
                low_zones,

            "high_risk_zone_count":
                len(
                    high_zones
                ),

            "moderate_risk_zone_count":
                len(
                    moderate_zones
                ),

            "low_risk_zone_count":
                len(
                    low_zones
                )
        },

        "note":
            (
                "This is an image-based "
                "demonstration of pest risk "
                "zoning. It does not represent "
                "actual geographic affected "
                "field area. Real geographic "
                "zoning requires calibrated "
                "UAV/GPS/geospatial data."
            )
    }

    # ==========================================================
    # SAVE OUTPUT
    # ==========================================================

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

    print(
        f"Zone analysis saved to: "
        f"{output_file}"
    )

    return result