import json
from pathlib import Path

from ai.detector import detect_image


def detect_frames(
    frames_folder: str,
    output_file: str
):
    """
    Runs YOLO detection on every extracted frame.

    If frame_metadata.json exists in the mission folder,
    frame number and timestamp information are attached
    to the corresponding detection result.
    """

    frames_folder = Path(frames_folder)
    output_file = Path(output_file)

    if not frames_folder.exists():
        raise FileNotFoundError(
            f"Frames folder not found: {frames_folder}"
        )

    # --------------------------------------------------
    # Load frame metadata
    # --------------------------------------------------

    metadata_file = (
        frames_folder.parent /
        "frame_metadata.json"
    )

    frame_metadata = {}

    if metadata_file.exists():

        with open(
            metadata_file,
            "r",
            encoding="utf-8"
        ) as file:

            metadata = json.load(file)

        frame_metadata = {
            item["frame"]: item
            for item in metadata
        }

    # --------------------------------------------------
    # Find extracted frames
    # --------------------------------------------------

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

    # --------------------------------------------------
    # Run YOLO on every frame
    # --------------------------------------------------

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

        frame_result = {
            "frame": image_file.name,
            "detections": detections
        }

        # Attach metadata when available
        if image_file.name in frame_metadata:

            metadata = frame_metadata[
                image_file.name
            ]

            frame_result[
                "original_frame_number"
            ] = metadata[
                "original_frame_number"
            ]

            frame_result[
                "timestamp_seconds"
            ] = metadata[
                "timestamp_seconds"
            ]

        all_results.append(
            frame_result
        )

    # --------------------------------------------------
    # Final result
    # --------------------------------------------------

    result = {
        "total_frames_processed": len(
            image_files
        ),
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