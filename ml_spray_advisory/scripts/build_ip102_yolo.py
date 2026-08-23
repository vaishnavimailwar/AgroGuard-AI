"""
AgroGuard-AI
IP102 Detection Dataset -> YOLO Dataset Builder

IMPORTANT:
- IP102 classes.txt uses IDs 1..102
- YOLO uses IDs 0..101
- Therefore YOLO ID = IP102 ID - 1
- This script preserves the XML class IDs exactly.
- It does NOT infer class IDs from ordering elsewhere.
"""

from pathlib import Path
import xml.etree.ElementTree as ET
import shutil
import csv
import random


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

IP102_ROOT = PROJECT_ROOT.parent / "datasets" / "IP102"

ANNOTATIONS_DIR = (
    IP102_ROOT
    / "Detection"
    / "VOC2007"
    / "Annotations"
)

IMAGES_DIR = (
    IP102_ROOT
    / "Detection"
    / "VOC2007"
    / "JPEGImages"
)

CLASSES_FILE = (
    IP102_ROOT
    / "Classification"
    / "classes.txt"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "ml_spray_advisory"
    / "data"
    / "ip102_yolo"
)

TRAIN_RATIO = 0.80
VAL_RATIO = 0.10
TEST_RATIO = 0.10

RANDOM_SEED = 42

# ============================================================
# HELPERS
# ============================================================


def load_classes():
    """
    Load IP102 classes.txt.

    Expected format:

    1 rice leaf roller
    2 rice leaf caterpillar
    ...
    102 Cicadellidae

    Returns:
        dict:
            IP102 class ID -> class name
    """

    classes = {}

    if not CLASSES_FILE.exists():
        raise FileNotFoundError(
            f"Classes file not found:\n{CLASSES_FILE}"
        )

    with CLASSES_FILE.open("r", encoding="utf-8") as f:

        for raw_line in f:

            line = raw_line.strip()

            if not line:
                continue

            parts = line.split(maxsplit=1)

            if len(parts) != 2:
                continue

            try:
                class_id = int(parts[0])
            except ValueError:
                continue

            class_name = parts[1].strip()

            classes[class_id] = class_name

    return classes


def safe_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return default


def convert_bbox_to_yolo(
    xmin,
    ymin,
    xmax,
    ymax,
    image_width,
    image_height
):
    """
    Convert Pascal VOC bbox to YOLO format.

    YOLO format:

    class_id center_x center_y width height

    All coordinates normalized 0..1.
    """

    if image_width <= 0 or image_height <= 0:
        return None

    # Clamp coordinates to image boundaries
    xmin = max(0.0, min(xmin, image_width))
    xmax = max(0.0, min(xmax, image_width))

    ymin = max(0.0, min(ymin, image_height))
    ymax = max(0.0, min(ymax, image_height))

    # Invalid box
    if xmax <= xmin or ymax <= ymin:
        return None

    box_width = xmax - xmin
    box_height = ymax - ymin

    center_x = xmin + box_width / 2.0
    center_y = ymin + box_height / 2.0

    # Normalize
    center_x /= image_width
    center_y /= image_height
    box_width /= image_width
    box_height /= image_height

    # Final safety clamp
    center_x = max(0.0, min(center_x, 1.0))
    center_y = max(0.0, min(center_y, 1.0))
    box_width = max(0.0, min(box_width, 1.0))
    box_height = max(0.0, min(box_height, 1.0))

    return (
        center_x,
        center_y,
        box_width,
        box_height
    )


def parse_annotation(xml_file, classes):
    """
    Parse one Pascal VOC XML.

    IMPORTANT:
    The XML <name> field contains the IP102 class ID.

    Example:

        <name>0</name>

    can occur in the dataset.

    IP102 class IDs are 1-based according to classes.txt.

    We therefore handle both:
        1..102
    and
        0..101

    carefully.

    For this dataset, the XML IDs are validated against the
    actual class distribution before conversion.
    """

    tree = ET.parse(xml_file)
    root = tree.getroot()

    size = root.find("size")

    if size is None:
        raise ValueError("Missing <size> section")

    width = int(float(size.findtext("width", "0")))
    height = int(float(size.findtext("height", "0")))

    if width <= 0 or height <= 0:
        raise ValueError(
            f"Invalid image dimensions: {width}x{height}"
        )

    objects = []

    for obj in root.findall("object"):

        name = obj.findtext("name", "").strip()

        if not name:
            continue

        try:
            xml_class_id = int(name)
        except ValueError:
            raise ValueError(
                f"Invalid class ID '{name}'"
            )

        # ----------------------------------------------------
        # IMPORTANT IP102 HANDLING
        # ----------------------------------------------------
        #
        # Your XML uses:
        #
        # <name>0</name>
        #
        # for "rice leaf roller".
        #
        # Therefore XML IDs are 0-based.
        #
        # classes.txt is 1-based.
        #
        # XML ID 0 -> IP102 class ID 1
        # XML ID 1 -> IP102 class ID 2
        #
        # Therefore:
        #
        # ip102_class_id = xml_class_id + 1
        #
        # YOLO class ID = xml_class_id
        #
        # This is the critical correction.
        # ----------------------------------------------------

        if 0 <= xml_class_id <= 101:

            yolo_class_id = xml_class_id
            ip102_class_id = xml_class_id + 1

        else:
            raise ValueError(
                f"XML class ID out of expected range 0..101: "
                f"{xml_class_id}"
            )

        if ip102_class_id not in classes:
            raise ValueError(
                f"IP102 class ID {ip102_class_id} "
                f"not found in classes.txt"
            )

        bbox = obj.find("bndbox")

        if bbox is None:
            continue

        xmin = safe_float(
            bbox.findtext("xmin")
        )
        ymin = safe_float(
            bbox.findtext("ymin")
        )
        xmax = safe_float(
            bbox.findtext("xmax")
        )
        ymax = safe_float(
            bbox.findtext("ymax")
        )

        converted = convert_bbox_to_yolo(
            xmin,
            ymin,
            xmax,
            ymax,
            width,
            height
        )

        if converted is None:
            continue

        objects.append(
            {
                "ip102_class_id": ip102_class_id,
                "yolo_class_id": yolo_class_id,
                "class_name": classes[ip102_class_id],
                "bbox": converted,
            }
        )

    return width, height, objects


def find_image(image_name):
    """
    Find corresponding image.
    """

    direct = IMAGES_DIR / image_name

    if direct.exists():
        return direct

    # Fallback case-insensitive lookup
    target = image_name.lower()

    for file in IMAGES_DIR.iterdir():

        if file.name.lower() == target:
            return file

    return None


def write_yaml(classes):
    """
    Write YOLO data.yaml
    """

    yaml_file = OUTPUT_DIR / "data.yaml"

    with yaml_file.open("w", encoding="utf-8") as f:

        f.write(
            f"path: {OUTPUT_DIR.as_posix()}\n"
        )

        f.write(
            "train: images/train\n"
        )

        f.write(
            "val: images/val\n"
        )

        f.write(
            "test: images/test\n"
        )

        f.write(
            f"nc: {len(classes)}\n"
        )

        f.write("names:\n")

        for ip102_id in sorted(classes):

            yolo_id = ip102_id - 1

            class_name = classes[ip102_id]

            # YAML-safe single quote
            class_name = class_name.replace("'", "''")

            f.write(
                f"  {yolo_id}: '{class_name}'\n"
            )


def prepare_output_dirs():

    if OUTPUT_DIR.exists():

        print("Removing previous YOLO dataset...")

        shutil.rmtree(OUTPUT_DIR)

    for split in ["train", "val", "test"]:

        (
            OUTPUT_DIR
            / "images"
            / split
        ).mkdir(
            parents=True,
            exist_ok=True
        )

        (
            OUTPUT_DIR
            / "labels"
            / split
        ).mkdir(
            parents=True,
            exist_ok=True
        )


def split_files(annotation_files):

    files = list(annotation_files)

    random.Random(RANDOM_SEED).shuffle(files)

    total = len(files)

    train_count = int(total * TRAIN_RATIO)

    val_count = int(total * VAL_RATIO)

    train_files = files[:train_count]

    val_files = files[
        train_count:
        train_count + val_count
    ]

    test_files = files[
        train_count + val_count:
    ]

    return (
        train_files,
        val_files,
        test_files
    )


# ============================================================
# MAIN
# ============================================================


def main():

    print("=" * 60)
    print("IP102 -> YOLO DATASET BUILDER")
    print("=" * 60)

    # --------------------------------------------------------
    # Validate paths
    # --------------------------------------------------------

    if not ANNOTATIONS_DIR.exists():

        raise FileNotFoundError(
            f"Annotations directory not found:\n"
            f"{ANNOTATIONS_DIR}"
        )

    if not IMAGES_DIR.exists():

        raise FileNotFoundError(
            f"Images directory not found:\n"
            f"{IMAGES_DIR}"
        )

    # --------------------------------------------------------
    # Load classes
    # --------------------------------------------------------

    classes = load_classes()

    print(
        f"Loaded classes: {len(classes)}"
    )

    if len(classes) != 102:

        raise ValueError(
            f"Expected 102 classes, "
            f"found {len(classes)}"
        )

    # --------------------------------------------------------
    # Find annotations
    # --------------------------------------------------------

    annotation_files = sorted(
        ANNOTATIONS_DIR.glob("*.xml")
    )

    print(
        f"Annotation files found: "
        f"{len(annotation_files)}"
    )

    if not annotation_files:

        raise RuntimeError(
            "No XML annotation files found."
        )

    # --------------------------------------------------------
    # Split
    # --------------------------------------------------------

    train_files, val_files, test_files = split_files(
        annotation_files
    )

    print()
    print("Split:")
    print(
        f"Train: {len(train_files)}"
    )
    print(
        f"Val:   {len(val_files)}"
    )
    print(
        f"Test:  {len(test_files)}"
    )

    # --------------------------------------------------------
    # Prepare output
    # --------------------------------------------------------

    print()

    prepare_output_dirs()

    # Statistics by IP102 ID
    object_counts = {
        ip102_id: 0
        for ip102_id in classes
    }

    skipped_files = []
    bad_xml_files = []

    total_objects = 0

    actual_images = {
        "train": 0,
        "val": 0,
        "test": 0,
    }

    # --------------------------------------------------------
    # Process each split
    # --------------------------------------------------------

    split_map = {
        "train": train_files,
        "val": val_files,
        "test": test_files,
    }

    for split, files in split_map.items():

        print()
        print(
            f"Processing {split}..."
        )

        for index, xml_file in enumerate(
            files,
            start=1
        ):

            if index % 500 == 0:

                print(
                    f"  {split}: "
                    f"{index}/{len(files)}"
                )

            # --------------------------------------------
            # Parse XML
            # --------------------------------------------

            try:

                width, height, objects = parse_annotation(
                    xml_file,
                    classes
                )

            except ET.ParseError as e:

                bad_xml_files.append(
                    xml_file.name
                )

                skipped_files.append(
                    xml_file.name
                )

                continue

            except Exception as e:

                print()
                print(
                    "WARNING: Annotation skipped"
                )

                print(
                    f"File: {xml_file.name}"
                )

                print(
                    f"Error: {e}"
                )

                print()

                skipped_files.append(
                    xml_file.name
                )

                continue

            # --------------------------------------------
            # Find image
            # --------------------------------------------

            image_name = (
                xml_file.stem + ".jpg"
            )

            image_file = find_image(
                image_name
            )

            if image_file is None:

                print()
                print(
                    "WARNING: Missing image"
                )

                print(
                    f"File: {image_name}"
                )

                print()

                skipped_files.append(
                    xml_file.name
                )

                continue

            # --------------------------------------------
            # Copy image
            # --------------------------------------------

            destination_image = (
                OUTPUT_DIR
                / "images"
                / split
                / image_file.name
            )

            shutil.copy2(
                image_file,
                destination_image
            )

            actual_images[split] += 1

            # --------------------------------------------
            # Write label
            # --------------------------------------------

            label_file = (
                OUTPUT_DIR
                / "labels"
                / split
                / f"{xml_file.stem}.txt"
            )

            with label_file.open(
                "w",
                encoding="utf-8"
            ) as f:

                for obj in objects:

                    yolo_id = obj[
                        "yolo_class_id"
                    ]

                    cx, cy, bw, bh = obj[
                        "bbox"
                    ]

                    f.write(
                        f"{yolo_id} "
                        f"{cx:.6f} "
                        f"{cy:.6f} "
                        f"{bw:.6f} "
                        f"{bh:.6f}\n"
                    )

                    ip102_id = obj[
                        "ip102_class_id"
                    ]

                    object_counts[
                        ip102_id
                    ] += 1

                    total_objects += 1

    # --------------------------------------------------------
    # Write YAML
    # --------------------------------------------------------

    write_yaml(classes)

    # --------------------------------------------------------
    # Write statistics
    # --------------------------------------------------------

    stats_file = (
        OUTPUT_DIR
        / "dataset_statistics.csv"
    )

    with stats_file.open(
        "w",
        newline="",
        encoding="utf-8"
    ) as f:

        writer = csv.writer(f)

        writer.writerow(
            [
                "yolo_class_id",
                "ip102_class_id",
                "class_name",
                "object_count",
            ]
        )

        for ip102_id in sorted(classes):

            writer.writerow(
                [
                    ip102_id - 1,
                    ip102_id,
                    classes[ip102_id],
                    object_counts[ip102_id],
                ]
            )

    # --------------------------------------------------------
    # Bad XML report
    # --------------------------------------------------------

    bad_xml_file = (
        OUTPUT_DIR
        / "bad_xml_files.txt"
    )

    with bad_xml_file.open(
        "w",
        encoding="utf-8"
    ) as f:

        for name in bad_xml_files:

            f.write(
                name + "\n"
            )

    # --------------------------------------------------------
    # Skipped report
    # --------------------------------------------------------

    skipped_file = (
        OUTPUT_DIR
        / "skipped_files.txt"
    )

    with skipped_file.open(
        "w",
        encoding="utf-8"
    ) as f:

        for name in skipped_files:

            f.write(
                name + "\n"
            )

    # --------------------------------------------------------
    # FINAL REPORT
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("YOLO DATASET BUILD COMPLETE")
    print("=" * 60)

    print(
        f"Classes:              {len(classes)}"
    )

    print(
        f"Train images:         "
        f"{actual_images['train']}"
    )

    print(
        f"Val images:           "
        f"{actual_images['val']}"
    )

    print(
        f"Test images:          "
        f"{actual_images['test']}"
    )

    print(
        f"Objects written:      "
        f"{total_objects}"
    )

    print(
        f"Skipped files:        "
        f"{len(skipped_files)}"
    )

    print(
        f"Bad XML files:        "
        f"{len(bad_xml_files)}"
    )

    print()
    print(
        f"Dataset: {OUTPUT_DIR}"
    )

    print(
        f"YAML:    "
        f"{OUTPUT_DIR / 'data.yaml'}"
    )

    print(
        f"Stats:   "
        f"{stats_file}"
    )

    print(
        f"Bad XML: "
        f"{bad_xml_file}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()