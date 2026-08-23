from pathlib import Path
import csv


PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_FILE = (
    PROJECT_ROOT
    / "ml_spray_advisory"
    / "data"
    / "advisory_master.csv"
)


FIELDNAMES = [
    "crop",
    "pest",
    "pest_species",
    "plant_stage",
    "symptom_leaf_damage",
    "symptom_yellowing",
    "symptom_curling",
    "symptom_spots",
    "symptom_holes",
    "symptom_wilting",
    "pest_density",
    "affected_area_percent",
    "severity",
    "economic_threshold",
    "temperature",
    "humidity",
    "season",
    "intervention",
    "recommendation_class",
    "active_ingredient",
    "formulation",
    "dose",
    "application_method",
    "symptom_text",
    "evidence_type",
    "source",
    "source_date",
]


# IMPORTANT:
# These are seed records for the dataset structure.
# Unknown fields remain empty rather than being guessed.
SEED_RECORDS = [
    {
        "crop": "Rice",
        "pest": "Caterpillars",
        "pest_species": "Scirpophaga incertulas",
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
        "economic_threshold": "25% dead hearts; 2 egg masses/m2",
        "temperature": "",
        "humidity": "",
        "season": "",
        "intervention": "IPM / validated crop-specific control",
        "recommendation_class": "stem_borer_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Dead heart symptoms in vegetative stage and white ear symptoms "
            "during reproductive stage."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU crop protection - rice stem borer",
        "source_date": "",
    },
    {
        "crop": "Tomato",
        "pest": "Caterpillars",
        "pest_species": "Helicoverpa armigera",
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
        "intervention": "IPM / validated crop-specific control",
        "recommendation_class": "fruit_borer_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Feeding damage on foliage and circular holes in fruits."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU crop protection - tomato fruit borer",
        "source_date": "",
    },
    {
        "crop": "Brinjal",
        "pest": "Caterpillars",
        "pest_species": "Leucinodes orbonalis",
        "plant_stage": "",
        "symptom_leaf_damage": "1",
        "symptom_yellowing": "0",
        "symptom_curling": "0",
        "symptom_spots": "0",
        "symptom_holes": "1",
        "symptom_wilting": "1",
        "pest_density": "",
        "affected_area_percent": "",
        "severity": "",
        "economic_threshold": "",
        "temperature": "",
        "humidity": "",
        "season": "",
        "intervention": "IPM / validated crop-specific control",
        "recommendation_class": "shoot_fruit_borer_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Terminal shoot withering, bore holes in shoots and fruits, "
            "and flower-bud shedding."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU crop protection - brinjal shoot and fruit borer",
        "source_date": "",
    },
    {
        "crop": "Okra",
        "pest": "Caterpillars",
        "pest_species": "Helicoverpa armigera",
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
        "intervention": "IPM / validated crop-specific control",
        "recommendation_class": "fruit_borer_management",
        "active_ingredient": "",
        "formulation": "",
        "dose": "",
        "application_method": "",
        "symptom_text": (
            "Feeding damage to flowers and circular bore holes in fruits."
        ),
        "evidence_type": "official agricultural extension",
        "source": "TNAU crop protection - okra fruit borer",
        "source_date": "",
    },
]


def build_dataset():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open(
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=FIELDNAMES,
            extrasaction="ignore",
        )

        writer.writeheader()
        writer.writerows(SEED_RECORDS)

    print(f"Dataset written to: {OUTPUT_FILE}")
    print(f"Records written: {len(SEED_RECORDS)}")
    print(f"Columns: {len(FIELDNAMES)}")


if __name__ == "__main__":
    build_dataset()