from kfp import dsl


@dsl.container_component
def train_model():
    return dsl.ContainerSpec(
        image="mlop-test-trainer:latest",
        command=["sh", "-c"],
        args=[
            "MLFLOW_TRACKING_URI=file:///mlruns python train.py --register-model"
        ],
    )


@dsl.pipeline(name="mlop-test-train-pipeline")
def train_pipeline():
    train_model()
