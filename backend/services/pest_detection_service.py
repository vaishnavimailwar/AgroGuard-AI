from ultralytics import YOLO
from pathlib import Path


# ============================================================
# AGROGUARD YOLO MODEL
# ============================================================

# Correct AgroGuard 12-class trained model
MODEL_PATH = Path(
    r"C:\Users\Hp\Desktop\MajorProject\AgroGuard-AI"
    r"\UAV-Assisted-Agricultural-Pest-Surveillance"
    r"\YOLOv11n - Model Weights"
    r"\best.pt"
)


# ============================================================
# EXPECTED AGROGUARD CLASSES
# ============================================================

EXPECTED_CLASSES = [
    "Ants",
    "Bees",
    "Beetles",
    "Caterpillars",
    "Earthworms",
    "Earwigs",
    "Grasshoppers",
    "Moths",
    "Slugs",
    "Snails",
    "Wasps",
    "Weevils",
]


# ============================================================
# MODEL CACHE
# ============================================================

_model = None


# ============================================================
# LOAD MODEL
# ============================================================

def get_model():
    """
    Load the trained AgroGuard 12-class YOLO model.

    The model is loaded only once and then reused.
    """

    global _model

    if _model is None:

        if not MODEL_PATH.exists():

            raise FileNotFoundError(
                f"AgroGuard model not found: {MODEL_PATH}"
            )

        print(
            f"Loading AgroGuard YOLO model from: {MODEL_PATH}"
        )

        _model = YOLO(
            str(MODEL_PATH)
        )

        print(
            "AgroGuard YOLO model loaded successfully."
        )

        print(
            f"Number of classes: {len(_model.names)}"
        )

        print(
            f"Classes: {_model.names}"
        )

        # ------------------------------------------------------
        # Verify that this is the intended 12-class model
        # ------------------------------------------------------

        actual_classes = list(
            _model.names.values()
        )

        if actual_classes != EXPECTED_CLASSES:

            raise RuntimeError(
                "\nWrong YOLO model loaded!\n"
                f"Expected classes: {EXPECTED_CLASSES}\n"
                f"Actual classes: {actual_classes}\n"
                f"Model path: {MODEL_PATH}"
            )

        print(
            "AgroGuard 12-class model verification: PASSED"
        )

    return _model


# ============================================================
# DETECT PESTS
# ============================================================

def detect_pests(
    image_path: str,
    confidence: float = 0.25
):
    """
    Run AgroGuard pest detection on an image.

    Parameters
    ----------
    image_path : str
        Path to input image.

    confidence : float
        Minimum YOLO confidence threshold.

    Returns
    -------
    list
        List of detected pests.
    """

    model = get_model()

    image_path = Path(
        image_path
    )

    if not image_path.exists():

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    results = model.predict(
        source=str(image_path),
        conf=confidence,
        verbose=False
    )

    detections = []

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            class_id = int(
                box.cls[0].item()
            )

            confidence_score = float(
                box.conf[0].item()
            )

            class_name = model.names.get(
                class_id,
                "Unknown"
            )

            xyxy = box.xyxy[0].tolist()

            detections.append(
                {
                    "class_id": class_id,

                    "class_name": class_name,

                    "confidence": round(
                        confidence_score,
                        4
                    ),

                    "bbox": [
                        round(float(x), 2)
                        for x in xyxy
                    ]
                }
            )

    return detections