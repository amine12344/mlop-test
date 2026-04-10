# mlop-test

A full-stack demo repository containing:

- `app/`: Node.js Express API with PostgreSQL connectivity
- `frontend/`: browser UI assets and client-side JavaScript
- `helm/`: Helm chart for deploying the API, frontend, and Postgres
- `k8s/manual/`: plain Kubernetes manifests for manual deployment
- `docker-compose.yml`: local multi-container development environment
- `nginx/`: reverse proxy configuration used by Docker Compose
- multiple Dockerfiles for build experimentation

## Project overview

This repository is built as a small MLOps test project that demonstrates:

- a backend API service running on Node.js and Express
- a PostgreSQL database
- a simple frontend application
- local development with Docker Compose
- Kubernetes deployment via raw manifests and Helm

## Folder structure

- `app/`
  - Node.js API server source code
  - `package.json` defines runtime dependencies and start script
  - `app.js` exposes endpoints: `/`, `/healthz`, `/readyz`, `/db`

- `frontend/`
  - client-side application assets
  - `index.html`, `app.js`, and a simple UI to call the API and database endpoints

- `helm/mlop-test/`
  - Helm chart for application deployment
  - chart metadata in `Chart.yaml`
  - defaults in `values.yaml`
  - deploys `api`, `frontend`, `postgres`, and optional `ingress`

- `init-helm-lab/`
  - additional simple Helm example chart with basic deployment and service templates

- `k8s/manual/`
  - Kubernetes manifests for manual deployment of API, frontend, Postgres, namespace, and secrets

- `nginx/`
  - `nginx.conf` defines proxy routing for API and health/database endpoints

- `Dockerfile.bad`, `Dockerfile.multistage`, `Dockerfile.optimized`
  - example Dockerfiles for building the API image with different strategies

- `docker-compose.yml`
  - local compose stack with `proxy`, `api`, and `db` services
  - uses Postgres for persistence and nginx for request routing

## Local development with Docker Compose

1. Build and start the stack:

```bash
docker compose up --build
```

2. Open the application in the browser:

```text
http://localhost:8080
```

3. API endpoints available through the proxy:

- `/` — service metadata
- `/health` — health status
- `/db` — database connectivity check

4. Stop the stack:

```bash
docker compose down
```

## Run the API directly

1. Install dependencies:

```bash
cd app
npm install
```

2. Start the API server:

```bash
npm start
```

3. Set database environment variables as needed:

```bash
PORT=8080 DB_HOST=postgres DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres DB_PORT=5432 npm start
```

## Build a Docker image for the API

Example using the provided bad Dockerfile:

```bash
docker build -f Dockerfile.bad -t lab3-api:bad .
```

Then run it:

```bash
docker run --rm -p 8080:8080 lab3-api:bad
```

## Helm deployment

Install the chart from `helm/mlop-test`:

```bash
helm install mlop-test helm/mlop-test --namespace mlop-test-helm --create-namespace
```

If ingress is enabled, the default host is configured as `mlop.local` in `helm/mlop-test/values.yaml`.

## Kubernetes manual deployment

Apply the manifests in `k8s/manual`:

```bash
kubectl apply -f k8s/manual
```

## Notes

- The Docker Compose stack does not currently include the `frontend/` container. It uses `nginx/` as a proxy in front of the API.
- The Helm chart is the primary deployment artifact for Kubernetes-based installation.
- `init-helm-lab/` contains a minimal example chart for learning Helm basics.

## Contact

This repository is intended as a demo/test app for local and Kubernetes-based deployment workflows.
