import csv
import xml.etree.ElementTree as ET
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

IP102_ROOT = PROJECT_ROOT.parent / "datasets" / "IP102" / "Detection" / "VOC2007"

ANNOTATIONS_DIR = IP102_ROOT / "Annotations"
IMAGES_DIR = IP102_ROOT / "JPEGImages"

CLASSES_FILE = PROJECT_ROOT.parent / "datasets" / "IP102" / "Classification" / "classes.txt"

MAPPING_FILE = (
    PROJECT_ROOT
    / "ml_spray_advisory"
    / "data"
    / "ip102_agroguard_mapping.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "ml_spray_advisory"
    / "data"
    / "ip102_detection_index.csv"
)

# TEST FIRST.
# Once verified, change this to None for the complete dataset.
MAX_FILES = None


# ---------------------------------------------------------
# LOAD IP102 CLASSES
# ---------------------------------------------------------

classes = {}

with open(CLASSES_FILE, "r", encoding="utf-8-sig") as f:

    for line in f:

        line = line.strip()

        if not line:
            continue

        parts = line.split(maxsplit=1)

        if len(parts) != 2:
            continue

        class_id = int(parts[0])
        class_name = parts[1].strip()

        classes[class_id] = class_name


print(f"Loaded IP102 classes: {len(classes)}")


# ---------------------------------------------------------
# LOAD AGROGUARD MAPPING
# ---------------------------------------------------------

mapping = {}

with open(MAPPING_FILE, "r", encoding="utf-8-sig") as f:

    for row in csv.DictReader(f):

        class_id = row["ip102_id"].strip()

        mapping[class_id] = row


print(f"Loaded AgroGuard mappings: {len(mapping)}")


# ---------------------------------------------------------
# FIND XML FILES
# ---------------------------------------------------------

xml_files = sorted(ANNOTATIONS_DIR.glob("*.xml"))

if MAX_FILES is not None:
    xml_files = xml_files[:MAX_FILES]

print(f"Processing {len(xml_files)} annotation files...")


# ---------------------------------------------------------
# EXTRACT RECORDS
# ---------------------------------------------------------

records = []

for count, xml_file in enumerate(xml_files, start=1):

    try:

        tree = ET.parse(xml_file)
        root = tree.getroot()

    except Exception as e:

        print(f"WARNING: Could not read {xml_file.name}: {e}")
        continue


    image_name = xml_file.stem + ".jpg"

    image_path = IMAGES_DIR / image_name


    size = root.find("size")

    if size is None:
        continue


    width = int(size.findtext("width", "0"))
    height = int(size.findtext("height", "0"))

    image_area = width * height


    for obj in root.findall("object"):

        # -------------------------------------------------
        # XML stores ZERO-BASED class IDs.
        #
        # Example:
        # XML 0 -> classes.txt 1
        # XML 1 -> classes.txt 2
        # XML 2 -> classes.txt 3
        # -------------------------------------------------

        raw_id = obj.findtext("name", "").strip()

        if not raw_id:
            continue

        try:
            xml_class_id = int(raw_id)
        except ValueError:
            continue


        ip102_class_id = xml_class_id + 1

        ip102_class = classes.get(
            ip102_class_id,
            f"UNKNOWN_CLASS_{ip102_class_id}"
        )


        # -------------------------------------------------
        # FIND AGROGUARD MAPPING
        # -------------------------------------------------

        class_mapping = mapping.get(str(ip102_class_id))


        if class_mapping:

            agroguard_group = class_mapping["agroguard_group"].strip()
            mapping_status = class_mapping["mapping_status"].strip()

        else:

            agroguard_group = ""
            mapping_status = "UNMAPPED"


        # -------------------------------------------------
        # BOUNDING BOX
        # -------------------------------------------------

        bbox = obj.find("bndbox")

        if bbox is None:
            continue


        xmin = float(bbox.findtext("xmin", "0"))
        ymin = float(bbox.findtext("ymin", "0"))
        xmax = float(bbox.findtext("xmax", "0"))
        ymax = float(bbox.findtext("ymax", "0"))


        bbox_width = max(0, xmax - xmin)
        bbox_height = max(0, ymax - ymin)

        bbox_area = bbox_width * bbox_height


        if image_area > 0:

            affected_area_percent = (
                bbox_area / image_area
            ) * 100

        else:

            affected_area_percent = 0


        # -------------------------------------------------
        # RECORD
        # -------------------------------------------------

        records.append({

            "image": image_name,

            "width": width,

            "height": height,

            "ip102_class_id": ip102_class_id,

            "ip102_class": ip102_class,

            "agroguard_group": agroguard_group,

            "mapping_status": mapping_status,

            "xmin": xmin,

            "ymin": ymin,

            "xmax": xmax,

            "ymax": ymax,

            "bbox_area_percent": round(
                affected_area_percent,
                4
            ),

        })


    if count % 10 == 0:

        print(
            f"Processed {count}/{len(xml_files)} files"
        )


# ---------------------------------------------------------
# WRITE CSV
# ---------------------------------------------------------

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


fieldnames = [

    "image",

    "width",

    "height",

    "ip102_class_id",

    "ip102_class",

    "agroguard_group",

    "mapping_status",

    "xmin",

    "ymin",

    "xmax",

    "ymax",

    "bbox_area_percent",

]


with open(
    OUTPUT_FILE,
    "w",
    newline="",
    encoding="utf-8"
) as f:

    writer = csv.DictWriter(
        f,
        fieldnames=fieldnames
    )

    writer.writeheader()

    writer.writerows(records)


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

print()
print("=" * 60)
print("IP102 EXTRACTION COMPLETE")
print("=" * 60)

print(
    f"Annotation files processed: {len(xml_files)}"
)

print(
    f"Objects extracted: {len(records)}"
)

print(
    f"Output: {OUTPUT_FILE}"
)

print("=" * 60)
