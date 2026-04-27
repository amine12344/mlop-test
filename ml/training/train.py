import argparse
import json
import os
from pathlib import Path

import mlflow
import mlflow.sklearn
from joblib import dump
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split


def parse_args():
    parser = argparse.ArgumentParser(description="Train demo classifier with MLflow tracking")
    parser.add_argument("--experiment-name", default="mlop-test-iris")
    parser.add_argument("--model-name", default="iris-classifier")
    parser.add_argument("--n-estimators", type=int, default=100)
    parser.add_argument("--max-depth", type=int, default=5)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    parser.add_argument("--register-model", action="store_true")
    parser.add_argument("--artifact-dir", default="ml/training/artifacts")
    return parser.parse_args()


def main():
    args = parse_args()

    tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment(args.experiment_name)

    artifact_dir = Path(args.artifact_dir)
    artifact_dir.mkdir(parents=True, exist_ok=True)

    X, y = load_iris(return_X_y=True, as_frame=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=args.test_size,
        random_state=args.random_state,
        stratify=y,
    )

    params = {
        "n_estimators": args.n_estimators,
        "max_depth": args.max_depth,
        "test_size": args.test_size,
        "random_state": args.random_state,
        "dataset": "sklearn.load_iris",
    }

    with mlflow.start_run() as run:
        mlflow.log_params(params)

        model = RandomForestClassifier(
            n_estimators=args.n_estimators,
            max_depth=args.max_depth,
            random_state=args.random_state,
        )
        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        metrics = {
            "accuracy": accuracy_score(y_test, predictions),
            "f1_macro": f1_score(y_test, predictions, average="macro"),
        }

        mlflow.log_metrics(metrics)

        model_path = artifact_dir / "model.joblib"
        metrics_path = artifact_dir / "metrics.json"
        features_path = artifact_dir / "features.json"

        dump(model, model_path)

        metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        features_path.write_text(json.dumps(list(X.columns), indent=2), encoding="utf-8")

        mlflow.log_artifact(str(metrics_path), artifact_path="reports")
        mlflow.log_artifact(str(features_path), artifact_path="metadata")

        if args.register_model:
            mlflow.sklearn.log_model(
                sk_model=model,
                artifact_path="model",
                registered_model_name=args.model_name,
            )
        else:
            mlflow.sklearn.log_model(
                sk_model=model,
                artifact_path="model",
            )

        print(json.dumps({
            "run_id": run.info.run_id,
            "tracking_uri": tracking_uri,
            "experiment_name": args.experiment_name,
            "metrics": metrics,
            "registered_model": args.model_name if args.register_model else None,
        }, indent=2))


if __name__ == "__main__":
    main()