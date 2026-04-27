from kfp import dsl


@dsl.container_component
def train_model():
    return dsl.ContainerSpec(
        image="mlop-test-trainer:latest",
        command=["python"],
        args=["train.py", "--register-model"],
        env={
            "MLFLOW_TRACKING_URI": "file:///mlruns"
        },
    )


@dsl.pipeline(name="mlop-test-train-pipeline")
def train_pipeline():
    train_model()