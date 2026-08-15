from ultralytics import YOLO

from config import MODEL_PATH

model = None


def load_model():

    global model

    if model is None:

        print("Loading YOLO Model...")

        model = YOLO(str(MODEL_PATH))

        print("Model Loaded Successfully")

    return model