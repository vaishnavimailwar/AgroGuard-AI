from pathlib import Path
import csv
from typing import Optional


# ==========================================================
# PROJECT PATH
# ==========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

ADVISORY_FILE = (
    BASE_DIR
    / "ml_spray_advisory"
    / "data"
    / "advisory_master.csv"
)


# ==========================================================
# LOAD DATASET
# ==========================================================

def load_advisory_records():

    if not ADVISORY_FILE.exists():

        raise FileNotFoundError(
            f"Advisory dataset not found: {ADVISORY_FILE}"
        )

    with open(
        ADVISORY_FILE,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(file)

        return list(reader)


# ==========================================================
# NORMALIZE TEXT
# ==========================================================

def normalize(value):

    if value is None:
        return ""

    return str(value).strip().lower()


# ==========================================================
# FIND ADVISORY RECORD
# ==========================================================

def find_advisory_record(
    pest: str,
    crop: Optional[str] = None
):

    records = load_advisory_records()

    pest_normalized = normalize(pest)
    crop_normalized = normalize(crop)

    # ------------------------------------------------------
    # 1. Exact crop + pest match
    # ------------------------------------------------------

    if crop_normalized:

        for record in records:

            record_pest = normalize(
                record.get("pest")
            )

            record_crop = normalize(
                record.get("crop")
            )

            if (
                record_pest == pest_normalized
                and record_crop == crop_normalized
            ):

                return record

    # ------------------------------------------------------
    # 2. Pest-only match
    # ------------------------------------------------------

    for record in records:

        record_pest = normalize(
            record.get("pest")
        )

        if record_pest == pest_normalized:

            return record

    # ------------------------------------------------------
    # 3. Species match
    # ------------------------------------------------------

    for record in records:

        species = normalize(
            record.get("pest_species")
        )

        if pest_normalized and pest_normalized in species:

            return record

    return None


# ==========================================================
# EMPTY FIELD HELPER
# ==========================================================

def clean_value(value):

    if value is None:
        return None

    value = str(value).strip()

    if value == "":
        return None

    return value


# ==========================================================
# GENERATE SPRAY ADVISORY
# ==========================================================

def generate_spray_advisory(
    pest: str,
    confidence: float,
    severity: str,
    crop: Optional[str] = None
):

    pest = str(pest).strip()

    severity = str(
        severity or "UNKNOWN"
    ).upper()

    confidence = round(
        float(confidence),
        3
    )

    # ------------------------------------------------------
    # Find advisory
    # ------------------------------------------------------

    record = find_advisory_record(
        pest=pest,
        crop=crop
    )

    # ------------------------------------------------------
    # No advisory available
    # ------------------------------------------------------

    if record is None:

        return {

            "pest": pest,

            "confidence": confidence,

            "severity": severity,

            "crop": crop or "Crop-dependent",

            "advisory_status":
                "No crop-specific advisory record found",

            "monitoring":
                "Inspect affected plants and nearby plants "
                "for continued pest activity.",

            "action":
                "Continue monitoring and use validated "
                "integrated pest management practices.",

            "intervention":
                "Consult a qualified agricultural extension "
                "recommendation before selecting any pesticide.",

            "recommendation_class": None,

            "economic_threshold": None,

            "active_ingredient": None,

            "formulation": None,

            "dose": None,

            "application_method": None,

            "source": None,

            "evidence_type": None
        }

    # ------------------------------------------------------
    # Extract advisory fields
    # ------------------------------------------------------

    symptom_text = clean_value(
        record.get("symptom_text")
    )

    intervention = clean_value(
        record.get("intervention")
    )

    recommendation_class = clean_value(
        record.get("recommendation_class")
    )

    economic_threshold = clean_value(
        record.get("economic_threshold")
    )

    active_ingredient = clean_value(
        record.get("active_ingredient")
    )

    formulation = clean_value(
        record.get("formulation")
    )

    dose = clean_value(
        record.get("dose")
    )

    application_method = clean_value(
        record.get("application_method")
    )

    source = clean_value(
        record.get("source")
    )

    evidence_type = clean_value(
        record.get("evidence_type")
    )

    # ------------------------------------------------------
    # Monitoring message
    # ------------------------------------------------------

    if symptom_text:

        monitoring = (
            "Monitor plants for: "
            + symptom_text
        )

    else:

        monitoring = (
            "Monitor affected plants and nearby plants "
            "for continued pest activity."
        )

    # ------------------------------------------------------
    # Action
    # ------------------------------------------------------

    if intervention:

        action = intervention

    else:

        action = (
            "Follow validated integrated pest "
            "management practices."
        )

    # ------------------------------------------------------
    # Intervention message
    # ------------------------------------------------------

    if (
        active_ingredient
        or formulation
        or dose
    ):

        intervention_message = (
            "Use only the validated crop-specific "
            "recommendation recorded for this pest."
        )

    else:

        intervention_message = (
            "Consult a qualified agricultural extension "
            "recommendation before selecting any pesticide."
        )

    # ------------------------------------------------------
    # Final advisory
    # ------------------------------------------------------

    return {

        "pest": pest,

        "confidence": confidence,

        "severity": severity,

        "crop": clean_value(
            record.get("crop")
        ) or crop or "Crop-dependent",

        "advisory_status":
            "Verified advisory record found",

        "monitoring": monitoring,

        "action": action,

        "intervention":
            intervention_message,

        "recommendation_class":
            recommendation_class,

        "economic_threshold":
            economic_threshold,

        "active_ingredient":
            active_ingredient,

        "formulation":
            formulation,

        "dose":
            dose,

        "application_method":
            application_method,

        "source":
            source,

        "evidence_type":
            evidence_type
    }


# ==========================================================
# GENERATE ADVISORIES FOR MULTIPLE DETECTIONS
# ==========================================================

def generate_advisories(
    detections,
    severity,
    crop=None
):

    advisories = []

    for detection in detections:

        pest = (
            detection.get("class_name")
            or detection.get("pest")
            or "Unknown"
        )

        confidence = float(
            detection.get(
                "confidence",
                0
            )
        )

        advisory = generate_spray_advisory(
            pest=pest,
            confidence=confidence,
            severity=severity,
            crop=crop
        )

        advisories.append(
            advisory
        )

    return advisories


# ==========================================================
# TEST
# ==========================================================

if __name__ == "__main__":

    result = generate_spray_advisory(
        pest="Caterpillars",
        confidence=0.80,
        severity="HIGH",
        crop="Tomato"
    )

    print(result)