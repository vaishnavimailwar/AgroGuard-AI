from services.severity_services import (
    calculate_severity
)


def test_no_detections():

    result = calculate_severity(
        [
            {
                "frame": "frame_00000.jpg",
                "detections": []
            }
        ]
    )

    assert result["severity_level"] == "LOW"

    assert result["total_detections"] == 0


def test_ant_detection():

    result = calculate_severity(
        [
            {
                "frame": "frame_00000.jpg",
                "detections": [
                    {
                        "class_name": "Ants",
                        "confidence": 0.769
                    }
                ]
            }
        ]
    )

    assert result["total_detections"] == 1

    assert "Ants" in result[
        "detected_pests"
    ]

    assert result[
        "severity_score"
    ] > 0


if __name__ == "__main__":

    test_no_detections()

    test_ant_detection()

    print(
        "Severity service tests passed."
    )