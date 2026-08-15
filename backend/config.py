from pathlib import Path

# Backend Directory
BASE_DIR = Path(__file__).resolve().parent

# Project Root
PROJECT_ROOT = BASE_DIR.parent

# Existing Repository
REFERENCE_REPO = PROJECT_ROOT / "UAV-Assisted-Agricultural-Pest-Surveillance"

# YOLO Model
MODEL_PATH = (
    REFERENCE_REPO
    / "YOLOv11n - Model Weights"
    / "best.pt"
)

# Upload Folder
UPLOAD_FOLDER = BASE_DIR / "uploads"
TEST_IMAGE_FOLDER = PROJECT_ROOT / "test_images"