from pathlib import Path
import csv


PROJECT_ROOT = Path(__file__).resolve().parents[2]

CSV_FILE = (
    PROJECT_ROOT
    / "ml_spray_advisory"
    / "data"
    / "advisory_master.csv"
)


NEW_RECORDS = [
    {
        "crop": "Rice",
        "pest": "Grasshoppers",
        "pest_species": "Hieroglyphus banian; Oxya nitidula",
        "plant_stage": "Seedling to panicle stage",
        "symptom_leaf_damage": "1",
        "symptom_yellowing": "0",
        "symptom_curling": "0",
        "symptom_spots": "0",
        "symptom_holes": "0",
        "symptom_wilting": "0",
        "pest_density": "5 per sweep",
        "affected_area_percent": "",
        "severity": "",
        "economic_threshold": "Approximately 5 grasshoppers per sweep or visible damage",
        "temperature": "",
        "humidity": "",
        "season": "",
        "intervention": "Integrated pest management",
        "recommendation_class": "grasshopper_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Irregular feeding on seedlings and leaf blades; "
            "leaf-edge consumption; severe infestations may cause "
            "defoliation leaving midribs."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU Crop Protection - Rice Grasshopper",
        "source_date": "",
    },

    {
        "crop": "Brinjal",
        "pest": "Weevils",
        "pest_species": (
            "Myllocerus subfasciatus; Myllocerus discolor; "
            "Myllocerus viridanus"
        ),
        "plant_stage": "",
        "symptom_leaf_damage": "1",
        "symptom_yellowing": "0",
        "symptom_curling": "0",
        "symptom_spots": "0",
        "symptom_holes": "0",
        "symptom_wilting": "1",
        "pest_density": "",
        "affected_area_percent": "",
        "severity": "",
        "economic_threshold": "",
        "temperature": "",
        "humidity": "",
        "season": "",
        "intervention": "Integrated pest management",
        "recommendation_class": "weevil_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Adults cause notching of leaf margins; grubs feed on roots "
            "and may cause plant wilting."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU Crop Protection - Brinjal Ash Weevils",
        "source_date": "",
    },

    {
        "crop": "Okra",
        "pest": "Weevils",
        "pest_species": "Alcidodes affaber",
        "plant_stage": "",
        "symptom_leaf_damage": "1",
        "symptom_yellowing": "0",
        "symptom_curling": "0",
        "symptom_spots": "0",
        "symptom_holes": "1",
        "symptom_wilting": "0",
        "pest_density": "",
        "affected_area_percent": "",
        "severity": "",
        "economic_threshold": "",
        "temperature": "",
        "humidity": "",
        "season": "",
        "intervention": "Integrated pest management",
        "recommendation_class": "shoot_weevil_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Grubs feed in stems and form galls; adults feed on leaf buds "
            "and terminal shoots; bore holes may occur on shoots."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU Crop Protection - Okra Shoot Weevil",
        "source_date": "",
    },
]


def main():
    with CSV_FILE.open(
        "r",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        reader = csv.DictReader(file)
        fieldnames = reader.fieldnames
        rows = list(reader)

    existing_keys = {
        (
            row["crop"],
            row["pest"],
            row["pest_species"],
        )
        for row in rows
    }

    added = 0

    for record in NEW_RECORDS:
        key = (
            record["crop"],
            record["pest"],
            record["pest_species"],
        )

        if key not in existing_keys:
            rows.append(record)
            existing_keys.add(key)
            added += 1

    with CSV_FILE.open(
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Records added: {added}")
    print(f"Total records: {len(rows)}")
    print(f"Dataset: {CSV_FILE}")


if __name__ == "__main__":
    main()