import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import mlflow.pyfunc
from fastapi import FastAPI
from pydantic import BaseModel


MODEL_NAME = os.getenv("MODEL_NAME", "iris-classifier")
MODEL_STAGE = os.getenv("MODEL_STAGE", "None")  # None = latest version
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "file:/mlruns")

app = FastAPI()

model = None


class PredictRequest(BaseModel):
    value: float
    entity_id: Optional[str] = None
    metadata: Dict[str, Any] = {}


def load_model():
    global model
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

    if MODEL_STAGE.lower() == "none":
        model_uri = f"models:/{MODEL_NAME}/latest"
    else:
        model_uri = f"models:/{MODEL_NAME}/{MODEL_STAGE}"

    print(f"Loading model from: {model_uri}")
    model = mlflow.pyfunc.load_model(model_uri)


@app.on_event("startup")
def startup():
    load_model()


@app.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_name": MODEL_NAME,
        "stage": MODEL_STAGE,
    }


@app.post("/predict")
def predict(req: PredictRequest):
    start = time.time()

    # Model expects 2D array
    prediction = model.predict([[req.value]])

    latency = round((time.time() - start) * 1000, 3)

    return {
        "prediction": int(prediction[0]),
        "latency_ms": latency,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }