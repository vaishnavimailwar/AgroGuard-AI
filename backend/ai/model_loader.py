from ultralytics import YOLO

from config import MODEL_PATH


model = None


def load_model():

    global model

    if model is None:

        print(
            f"Loading YOLO Model from: {MODEL_PATH}"
        )

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"YOLO model not found: {MODEL_PATH}"
            )

        model = YOLO(
            str(MODEL_PATH)
        )

        print(
            "Model Loaded Successfully"
        )

        print(
            f"Number of classes: {len(model.names)}"
        )

    return model