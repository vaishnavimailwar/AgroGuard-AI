import json
import os

from ai.model_loader import load_model


def detect_image(image_path: str):

    """
    Run YOLO detection on one image.
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    model = load_model()

    results = model(
        image_path,
        verbose=False
    )

    detections = []

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            class_id = int(
                box.cls[0]
            )

            confidence = float(
                box.conf[0]
            )

            x1, y1, x2, y2 = (
                box.xyxy[0].tolist()
            )

            detections.append(
                {
                    "class_id": class_id,

                    "class_name": model.names[
                        class_id
                    ],

                    "confidence": round(
                        confidence,
                        3
                    ),

                    "bbox": {
                        "x1": round(
                            x1,
                            2
                        ),

                        "y1": round(
                            y1,
                            2
                        ),

                        "x2": round(
                            x2,
                            2
                        ),

                        "y2": round(
                            y2,
                            2
                        ),
                    },
                }
            )

    return detections


def detect_frames(
    frames_folder: str,
    output_file: str
):

    """
    Run YOLO detection on all images
    inside a folder.
    """

    model = load_model()

    if not os.path.exists(frames_folder):
        raise FileNotFoundError(
            f"Frames folder not found: {frames_folder}"
        )

    frame_files = sorted(
        [
            os.path.join(
                frames_folder,
                file
            )

            for file in os.listdir(
                frames_folder
            )

            if file.lower().endswith(
                (
                    ".jpg",
                    ".jpeg",
                    ".png"
                )
            )
        ]
    )

    all_results = []

    total_frames = len(
        frame_files
    )

    for index, frame_path in enumerate(
        frame_files,
        start=1
    ):

        print(
            f"Processing frame "
            f"{index}/{total_frames}: "
            f"{os.path.basename(frame_path)}"
        )

        results = model(
            frame_path,
            verbose=False
        )

        frame_detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(
                    box.cls[0]
                )

                confidence = float(
                    box.conf[0]
                )

                x1, y1, x2, y2 = (
                    box.xyxy[0].tolist()
                )

                frame_detections.append(
                    {
                        "class_id": class_id,

                        "class_name": model.names[
                            class_id
                        ],

                        "confidence": round(
                            confidence,
                            3
                        ),

                        "bbox": {
                            "x1": round(
                                x1,
                                2
                            ),

                            "y1": round(
                                y1,
                                2
                            ),

                            "x2": round(
                                x2,
                                2
                            ),

                            "y2": round(
                                y2,
                                2
                            ),
                        },
                    }
                )

        all_results.append(
            {
                "frame": os.path.basename(
                    frame_path
                ),

                "detections": frame_detections
            }
        )

    output_file = os.path.abspath(
        output_file
    )

    output_directory = os.path.dirname(
        output_file
    )

    if output_directory:
        os.makedirs(
            output_directory,
            exist_ok=True
        )

    result = {
        "total_frames_processed": total_frames,
        "frames": all_results
    }

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
        f"\nDetection results saved to: "
        f"{output_file}"
    )

    return result