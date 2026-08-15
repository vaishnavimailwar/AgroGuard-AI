from pathlib import Path

from ai.frame_extractor import extract_frames


VIDEO = Path(r"D:\MajorProject\test_videos\drone_test.mp4")

OUTPUT_FOLDER = Path(
    r"D:\MajorProject\test_videos\extracted_frames"
)


print("=" * 60)
print("AGROGUARD AI - FRAME EXTRACTION TEST")
print("=" * 60)

result = extract_frames(
    video_path=str(VIDEO),
    output_folder=str(OUTPUT_FOLDER),
    frame_interval=30
)

print()
print(f"Video          : {result['video']}")
print(f"Total Frames   : {result['total_frames']}")
print(f"FPS            : {result['fps']:.2f}")
print(f"Frames Saved   : {result['frames_saved']}")
print()
print(f"Frames Location:")
print(OUTPUT_FOLDER)