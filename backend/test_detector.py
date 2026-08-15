import json

from ai.detector import detect_image
from config import TEST_IMAGE_FOLDER


IMAGE = TEST_IMAGE_FOLDER / "ant.jpg"

OUTPUT_FILE = TEST_IMAGE_FOLDER / "ant_detection.json"


print("=" * 50)
print("AGROGUARD AI - DETECTOR TEST")
print("=" * 50)

detections = detect_image(str(IMAGE))

result = {
    "image": IMAGE.name,
    "total_objects": len(detections),
    "detections": detections
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(result, file, indent=4)

print()
print(f"Total Objects Detected : {len(detections)}")

for i, detection in enumerate(detections, start=1):

    print()
    print(f"Detection {i}")
    print(f"Class       : {detection['class_name']}")
    print(f"Confidence  : {detection['confidence']}")
    print(f"BoundingBox : {detection['bbox']}")

print()
print(f"JSON saved to : {OUTPUT_FILE}")