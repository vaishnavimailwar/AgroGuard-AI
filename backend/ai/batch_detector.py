import json
from pathlib import Path

from ai.detector import detect_image


def detect_frames(
    frames_folder: str,
    output_file: str
):
    """
    Runs the YOLO detector on every image
    inside a frames folder.

    The final results are stored in one JSON file.
    """

    frames_folder = Path(frames_folder)
    output_file = Path(output_file)

    if not frames_folder.exists():
        raise FileNotFoundError(
            f"Frames folder not found: {frames_folder}"
        )

    image_files = sorted(
        [
            file
            for file in frames_folder.iterdir()
            if file.suffix.lower() in {
                ".jpg",
                ".jpeg",
                ".png"
            }
        ]
    )

    all_results = []

    for frame_number, image_file in enumerate(
        image_files,
        start=1
    ):

        print(
            f"Processing frame "
            f"{frame_number}/{len(image_files)}: "
            f"{image_file.name}"
        )

        detections = detect_image(
            str(image_file)
        )

        all_results.append(
            {
                "frame": image_file.name,
                "detections": detections
            }
        )

    result = {
        "total_frames_processed": len(image_files),
        "frames": all_results
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