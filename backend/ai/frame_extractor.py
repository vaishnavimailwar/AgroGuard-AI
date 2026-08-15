import cv2
from pathlib import Path


def extract_frames(
    video_path: str,
    output_folder: str,
    frame_interval: int = 30
):
    """
    Extracts one frame after every `frame_interval`
    frames from a video.

    Example:
        frame_interval = 30
        → approximately one frame from every 30 video frames.
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

    frame_number = 0
    saved_frames = 0

    while True:

        success, frame = cap.read()

        if not success:
            break

        if frame_number % frame_interval == 0:

            output_path = (
                output_folder /
                f"frame_{saved_frames:05d}.jpg"
            )

            cv2.imwrite(
                str(output_path),
                frame
            )

            saved_frames += 1

        frame_number += 1

    cap.release()

    return {
        "video": video_path.name,
        "total_frames": total_frames,
        "fps": fps,
        "frames_saved": saved_frames
    }