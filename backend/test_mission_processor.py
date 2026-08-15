from pathlib import Path

from services.mission_processor import process_mission_video


VIDEO = Path(
    r"D:\MajorProject\test_videos\drone_test.mp4"
)

MISSION_FOLDER = Path(
    r"D:\MajorProject\test_mission_1"
)


print("=" * 60)
print("AGROGUARD AI - MISSION PROCESSING TEST")
print("=" * 60)

result = process_mission_video(
    video_path=str(VIDEO),
    mission_folder=str(MISSION_FOLDER),
    frame_interval=30
)

print()
print("=" * 60)
print("MISSION PROCESSING COMPLETED")
print("=" * 60)

print(
    f"Video              : "
    f"{result['video']}"
)

print(
    f"Total video frames : "
    f"{result['total_video_frames']}"
)

print(
    f"FPS                : "
    f"{result['video_fps']:.2f}"
)

print(
    f"Frames saved       : "
    f"{result['frames_saved']}"
)

print(
    f"Frames processed   : "
    f"{result['frames_processed']}"
)

print(
    f"Detection file     : "
    f"{result['detection_file']}"
)