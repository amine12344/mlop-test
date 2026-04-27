import hashlib
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from pydantic import BaseModel, Field


SERVICE_NAME = "mlop-test-inference"
MODEL_NAME = os.getenv("MODEL_NAME", "rule-based-demo-model")
MODEL_VERSION = os.getenv("MODEL_VERSION", "v0")
APP_VERSION = os.getenv("APP_VERSION", "dev")


app = FastAPI(
    title="MLOP Test Inference Service",
    version=APP_VERSION,
)


class PredictRequest(BaseModel):
    value: float = Field(..., description="Numeric feature used for demo prediction")
    entity_id: Optional[str] = Field(default=None, description="Optional entity id")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PredictResponse(BaseModel):
    service: str
    model_name: str
    model_version: str
    prediction: int
    score: float
    request_id: str
    latency_ms: float
    timestamp: str


def make_request_id(payload: Dict[str, Any]) -> str:
    raw = repr(sorted(payload.items())).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]


def score_value(value: float) -> float:
    # Simple deterministic baseline for early labs.
    # Later this function will call a real MLflow-loaded model.
    return round(value * 0.5, 6)


@app.get("/healthz")
def healthz():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "app_version": APP_VERSION,
    }


@app.get("/readyz")
def readyz():
    return {
        "status": "ready",
        "checks": {
            "model_loaded": True,
            "kafka_configured": bool(os.getenv("KAFKA_BOOTSTRAP_SERVERS")),
        },
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest, request: Request):
    start = time.perf_counter()

    body = payload.model_dump()
    request_id = request.headers.get("x-request-id") or make_request_id(body)

    score = score_value(payload.value)
    prediction = 1 if score >= 1.0 else 0

    latency_ms = round((time.perf_counter() - start) * 1000, 3)

    return PredictResponse(
        service=SERVICE_NAME,
        model_name=MODEL_NAME,
        model_version=MODEL_VERSION,
        prediction=prediction,
        score=score,
        request_id=request_id,
        latency_ms=latency_ms,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )