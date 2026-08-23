from pathlib import Path


# ============================================================
# BACKEND DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = BASE_DIR.parent


# ============================================================
# AGROGUARD TRAINED YOLO MODEL
# ============================================================

# This is the 30-epoch trained AgroGuard YOLO11 model.
MODEL_PATH = (
    PROJECT_ROOT
    / "UAV-Assisted-Agricultural-Pest-Surveillance"
    / "YOLOv11n - Model Weights"
    / "best.pt"
)

# ============================================================
# UPLOAD FOLDER
# ============================================================

UPLOAD_FOLDER = (
    BASE_DIR
    / "uploads"
)


# ============================================================
# TEST IMAGE FOLDER
# ============================================================

TEST_IMAGE_FOLDER = (
    PROJECT_ROOT
    / "test_images"
)