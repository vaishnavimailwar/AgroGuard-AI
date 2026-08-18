import cv2
import json
from pathlib import Path


def extract_frames(
    video_path: str,
    output_folder: str,
    frame_interval: int = 30
):
    """
    Extract frames from a video and preserve
    frame number + timestamp metadata.

    Example:
        frame_interval = 30
        At 30 FPS:
        frame 0  -> 0.0 seconds
        frame 30 -> 1.0 seconds
        frame 60 -> 2.0 seconds
    """

    video_path = Path(video_path)
    output_folder = Path(output_folder)

    output_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    if not video_path.exists():
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open video: {video_path}"
        )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    if fps <= 0:
        raise RuntimeError(
            f"Invalid FPS detected for video: {video_path}"
        )

    frame_number = 0
    saved_frames = 0

    frame_metadata = []

    while True:

        success, frame = cap.read()

        if not success:
            break

        if frame_number % frame_interval == 0:

            filename = f"frame_{saved_frames:05d}.jpg"

            output_path = output_folder / filename

            cv2.imwrite(
                str(output_path),
                frame
            )

            timestamp_seconds = frame_number / fps

            frame_metadata.append(
                {
                    "frame": filename,
                    "original_frame_number": frame_number,
                    "timestamp_seconds": round(
                        timestamp_seconds,
                        3
                    )
                }
            )

            saved_frames += 1

        frame_number += 1

    cap.release()

    metadata_path = (
        output_folder.parent /
        "frame_metadata.json"
    )

    with open(
        metadata_path,
        "w"
    ) as file:

        json.dump(
            frame_metadata,
            file,
            indent=4
        )

    return {
        "video": video_path.name,
        "total_frames": total_frames,
        "fps": fps,
        "frames_saved": saved_frames,
        "metadata_file": str(metadata_path),
        "frame_interval": frame_interval
    }