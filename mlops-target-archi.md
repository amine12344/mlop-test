# Target Architecture — End-to-End MLOps Platform

## Purpose

This document describes the final target architecture for the `mlop-test` MLOps bootcamp.

The goal is to evolve the existing application repository into a complete open-source MLOps platform.

## Target End-to-End Story

A user opens the frontend or calls the API.

The request reaches the Node.js application.

The application optionally calls a separate ML inference service.

The inference service loads a registered model from MLflow.

Each prediction emits an event to Kafka.

Kubeflow Pipelines handles training and evaluation.

MLflow tracks experiments and stores model versions.

Helm packages the application and platform services.

Argo CD reconciles Kubernetes state from Git.

GitHub Actions handles CI, image builds, pipeline triggers, and promotion gates.

## Target Runtime Flow

```text
User / Browser / API Client
  ↓
Frontend
  ↓
Node.js API Gateway
  ↓
ML Inference Service
  ↓
MLflow Model Registry
  ↓
Prediction Response
```

## Target Runtime Flow Target Training Flow

```text
GitHub Actions or Manual Trigger
  ↓
Kubeflow Pipeline
  ↓
Train Model
  ↓
Evaluate Model
  ↓
Log Metrics to MLflow
  ↓
Register Model in MLflow Registry
```

## Target Deployment Flow

```text
Git Commit
  ↓
GitHub Actions
  ↓
Build Docker Images
  ↓
Push Images to Registry
  ↓
Update GitOps Manifests
  ↓
Argo CD Sync
  ↓
Helm Deployment to Kubernetes
```

## Target Technology Stack

- **Backend**: Node.js with Express
- **ML Inference**: Python Flask or FastAPI
- **Model Registry**: MLflow
- **Experiment Tracking**: MLflow
- **Pipeline Orchestration**: Kubeflow Pipelines
- **Containerization**: Docker
- **Deployment**: Kubernetes with Helm
- **GitOps**: Argo CD
- **CI/CD**: GitHub Actions
- **Event Streaming**: Kafka
- **Monitoring**: Prometheus and Grafana
