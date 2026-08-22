from collections import Counter


def calculate_severity(detection_results):

    total_detections = 0

    confidence_sum = 0.0

    pest_counts = Counter()

    # --------------------------------------------------
    # Process frames
    # --------------------------------------------------

    for frame in detection_results:

        detections = frame.get(
            "detections",
            []
        )

        for detection in detections:

            confidence = float(
                detection.get(
                    "confidence",
                    0
                )
            )

            class_name = (
                detection.get("class_name")
                or detection.get("pest")
                or "Unknown"
            )

            total_detections += 1

            confidence_sum += confidence

            pest_counts[class_name] += 1

    # --------------------------------------------------
    # No detections
    # --------------------------------------------------

    if total_detections == 0:

        return {

            "severity_level": "LOW",

            "severity_score": 0.0,

            "total_detections": 0,

            "average_confidence": 0.0,

            "detected_pests": [],

            "pest_counts": {},

            "note":
                "No pest detections were found "
                "in the analyzed frames."
        }

    # --------------------------------------------------
    # Average confidence
    # --------------------------------------------------

    average_confidence = (
        confidence_sum /
        total_detections
    )

    # --------------------------------------------------
    # Demo-stage risk score
    # --------------------------------------------------

    severity_score = min(
        100.0,
        (
            total_detections * 5.0
            + average_confidence * 50.0
        )
    )

    # --------------------------------------------------
    # Classification
    # --------------------------------------------------

    if severity_score < 30:

        severity_level = "LOW"

    elif severity_score < 60:

        severity_level = "MODERATE"

    else:

        severity_level = "HIGH"

    # --------------------------------------------------
    # Result
    # --------------------------------------------------

    return {

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
            sorted(
                pest_counts.keys()
            ),

        "pest_counts":
            dict(
                pest_counts
            ),

        "note":
            "Severity is a detection-based "
            "software risk score. Actual affected "
            "field area requires calibrated UAV/"
            "geospatial data."
    }