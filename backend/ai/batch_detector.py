import json
from pathlib import Path

from ai.detector import detect_image


def detect_frames(
    frames_folder: str,
    output_file: str
):

    """
    Runs YOLO detection on every extracted frame.

    Metadata is attached when available.
    """

    frames_folder = Path(
        frames_folder
    )

    output_file = Path(
        output_file
    )

    if not frames_folder.exists():

        raise FileNotFoundError(
            f"Frames folder not found: "
            f"{frames_folder}"
        )

    # ======================================================
    # LOAD FRAME METADATA
    # ======================================================

    metadata_file = (
        frames_folder.parent
        / "frame_metadata.json"
    )

    frame_metadata = {}

    if metadata_file.exists():

        with open(
            metadata_file,
            "r",
            encoding="utf-8"
        ) as file:

            metadata = json.load(
                file
            )

        frame_metadata = {
            item["frame"]: item
            for item in metadata
        }

    # ======================================================
    # FIND IMAGES
    # ======================================================

    image_files = sorted(
        [
            file

            for file in frames_folder.iterdir()

            if file.suffix.lower()
            in {
                ".jpg",
                ".jpeg",
                ".png"
            }
        ]
    )

    all_results = []

    total_images = len(
        image_files
    )

    # ======================================================
    # DETECT EACH IMAGE
    # ======================================================

    for frame_number, image_file in enumerate(
        image_files,
        start=1
    ):

        print(
            f"Processing frame "
            f"{frame_number}/{total_images}: "
            f"{image_file.name}"
        )

        detections = detect_image(
            str(image_file)
        )

        frame_result = {
            "frame": image_file.name,
            "detections": detections
        }

        # --------------------------------------------------
        # Attach metadata
        # --------------------------------------------------

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

    # ======================================================
    # FINAL JSON
    # ======================================================

    result = {
        "total_frames_processed": total_images,
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