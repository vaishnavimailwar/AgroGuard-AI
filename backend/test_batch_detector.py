from pathlib import Path

from ai.batch_detector import detect_frames


FRAMES_FOLDER = Path(
    r"D:\MajorProject\test_videos\extracted_frames"
)

OUTPUT_FILE = Path(
    r"D:\MajorProject\test_videos\detection_results.json"
)


print("=" * 60)
print("AGROGUARD AI - BATCH DETECTION TEST")
print("=" * 60)

result = detect_frames(
    frames_folder=str(FRAMES_FOLDER),
    output_file=str(OUTPUT_FILE)
)

print()
print("=" * 60)
print("BATCH DETECTION COMPLETED")
print("=" * 60)

print(
    f"Frames Processed : "
    f"{result['total_frames_processed']}"
)

print(
    f"JSON File        : "
    f"{OUTPUT_FILE}"
)