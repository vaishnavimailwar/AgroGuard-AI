import json
from pathlib import Path

from ai.detector import detect_image
from config import TEST_IMAGE_FOLDER


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png"
}


print("=" * 60)
print("AGROGUARD AI - MULTI-IMAGE DETECTION TEST")
print("=" * 60)

image_files = sorted(
    [
        file
        for file in TEST_IMAGE_FOLDER.iterdir()
        if file.suffix.lower() in IMAGE_EXTENSIONS
    ]
)

if not image_files:
    raise FileNotFoundError(
        f"No images found in {TEST_IMAGE_FOLDER}"
    )


all_results = []

for index, image_file in enumerate(
    image_files,
    start=1
):

    print()
    print(
        f"Processing image "
        f"{index}/{len(image_files)}: "
        f"{image_file.name}"
    )

    detections = detect_image(
        str(image_file)
    )

    result = {
        "image": image_file.name,
        "total_objects": len(detections),
        "detections": detections
    }

    all_results.append(result)

    print(
        f"Objects detected: "
        f"{len(detections)}"
    )

    for detection in detections:

        print(
            f"  {detection['class_name']} "
            f"| confidence = "
            f"{detection['confidence']}"
        )


output_file = (
    TEST_IMAGE_FOLDER /
    "multi_image_detection_results.json"
)

with open(
    output_file,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        {
            "total_images": len(image_files),
            "results": all_results
        },
        file,
        indent=4
    )


print()
print("=" * 60)
print("MULTI-IMAGE TEST COMPLETED")
print("=" * 60)

print(
    f"Images processed : "
    f"{len(image_files)}"
)

print(
    f"Results saved to : "
    f"{output_file}"
)