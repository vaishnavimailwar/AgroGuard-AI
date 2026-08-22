from ultralytics import YOLO
from pathlib import Path


# ============================================================
# AGROGUARD YOLO MODEL
# ============================================================

# Actual location of your trained 30-epoch best.pt model
MODEL_PATH = Path(
    r"C:\Users\Hp\Desktop\MajorProject\AgroGuard-AI\ml_spray_advisory\models\best.pt"
)


# Model is loaded only once
_model = None


# ============================================================
# LOAD MODEL
# ============================================================

def get_model():
    """
    Load the trained AgroGuard YOLO model.

    The model is loaded once and then reused.
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

        _model = YOLO(str(MODEL_PATH))

        print(
            f"AgroGuard YOLO model loaded successfully."
        )

        print(
            f"Number of classes: {len(_model.names)}"
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
    Run pest detection on an image.

    Parameters
    ----------
    image_path : str
        Path to the input image.

    confidence : float
        Minimum YOLO confidence threshold.

    Returns
    -------
    list
        List of detected pests.
    """

    model = get_model()

    # --------------------------------------------------------
    # Check input image
    # --------------------------------------------------------

    image = Path(image_path)

    if not image.exists():
        raise FileNotFoundError(
            f"Input image not found: {image}"
        )

    # --------------------------------------------------------
    # Run YOLO inference
    # --------------------------------------------------------

    results = model.predict(
        source=str(image),
        conf=confidence,
        verbose=False
    )

    detections = []

    # --------------------------------------------------------
    # Process results
    # --------------------------------------------------------

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            class_id = int(box.cls[0])

            conf = float(box.conf[0])

            # Bounding box
            bbox = [
                round(float(x), 2)
                for x in box.xyxy[0]
            ]

            # Pest/class name
            pest_name = result.names[class_id]

            # ------------------------------------------------
            # Standard AgroGuard detection format
            # ------------------------------------------------

            detections.append(
                {
                    "class_name": pest_name,
                    "pest": pest_name,
                    "class_id": class_id,
                    "confidence": round(conf, 3),
                    "bbox": bbox
                }
            )

    return detections