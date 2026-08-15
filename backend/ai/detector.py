from ai.model_loader import load_model
import os
import json


def detect_image(image_path: str):
    """
    Runs YOLO detection on a single image
    and returns results as JSON.
    """

    model = load_model()

    results = model(image_path)

    detections = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])

            confidence = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append(
                {
                    "class_id": class_id,
                    "class_name": model.names[class_id],
                    "confidence": round(confidence, 3),
                    "bbox": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2),
                    },
                }
            )

    return detections


def detect_frames(frames_folder: str, output_file: str):
    """
    Runs YOLO detection on all extracted frames
    and saves the results as JSON.
    """

    model = load_model()

    frame_files = sorted(
        [
            os.path.join(frames_folder, file)
            for file in os.listdir(frames_folder)
            if file.lower().endswith((".jpg", ".jpeg", ".png"))
        ]
    )

    all_results = []

    for index, frame_path in enumerate(frame_files, start=1):

        print(
            f"Processing frame {index}/{len(frame_files)}: "
            f"{os.path.basename(frame_path)}"
        )

        results = model(frame_path)

        frame_detections = []

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])

                confidence = float(box.conf[0])

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                frame_detections.append(
                    {
                        "class_id": class_id,
                        "class_name": model.names[class_id],
                        "confidence": round(confidence, 3),
                        "bbox": {
                            "x1": round(x1, 2),
                            "y1": round(y1, 2),
                            "x2": round(x2, 2),
                            "y2": round(y2, 2),
                        },
                    }
                )

        all_results.append(
            {
                "frame": os.path.basename(frame_path),
                "detections": frame_detections
            }
        )

    os.makedirs(
        os.path.dirname(output_file),
        exist_ok=True
    )

    with open(output_file, "w") as file:

        json.dump(
            all_results,
            file,
            indent=4
        )

    print(f"\nDetection results saved to: {output_file}")

    return all_results