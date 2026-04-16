# 🚀 mlop-test

> A full-stack demo repository containing a Node.js Express API, PostgreSQL database, and frontend application with deployment examples for Docker Compose, Kubernetes, and Helm.

**Features:** Docker Compose • Kubernetes • Helm • CI/CD Ready

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Local Development](#local-development-with-docker-compose)
- [Building & Running](#building--running)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Jenkins & WSL Setup](#jenkins--wsl-setup)

---

## ⚡ Quick Start

Get up and running in seconds:

```bash
# Start all services
docker compose up --build

# Access the app
open http://localhost:8080
```

---

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 14+ (for direct API runs)
- kubectl (for Kubernetes deployments)
- Helm 3+ (for Helm deployments)
- Kind (for local Kubernetes cluster testing)

---

## 📦 Project Structure

### Core Components

| Directory | Purpose |
|-----------|---------|
| **`app/`** | Node.js Express API with PostgreSQL connectivity |
| **`frontend/`** | Browser UI assets and client-side JavaScript |
| **`helm/mlop-test/`** | Helm chart for Kubernetes deployment |
| **`k8s/manual/`** | Plain Kubernetes manifests for manual deployment |
| **`nginx/`** | Reverse proxy configuration |

### Configuration Files

| File | Purpose |
|------|---------|
| **`docker-compose.yml`** | Local multi-container development environment |
| **`Dockerfile.bad`** | Example of inefficient build strategies |
| **`Dockerfile.multistage`** | Multistage build example |
| **`Dockerfile.optimized`** | Optimized build strategy |
| **`kind-config.yaml`** | Kind cluster configuration |

---

## 🎯 What This Project Demonstrates

- ✅ **Backend API** — Node.js + Express microservice
- ✅ **Database** — PostgreSQL integration and connectivity
- ✅ **Frontend** — Simple, responsive browser-based UI
- ✅ **Local Development** — Docker Compose multi-container setup
- ✅ **Container Optimization** — Multiple Dockerfile strategies
- ✅ **Kubernetes** — Raw manifests and Helm deployments
- ✅ **CI/CD Ready** — Jenkins integration examples

---

## 📁 Directory Deep Dive

### 🔧 `app/` — Express API

Node.js API server configuration:

```
app/
├── package.json       # Dependencies and start script
├── app.js            # Express server
└── Dockerfile        # Container image definition
```

**Key Endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Service metadata |
| `GET /healthz` | Health status check |
| `GET /readyz` | Readiness probe |
| `GET /db` | Database connectivity check |

---

### 🎨 `frontend/` — Client Application

Static assets and UI:

```
frontend/
├── index.html        # Main page
├── app.js           # Frontend logic
├── nginx.conf       # Web server config
└── Dockerfile       # Container image
```

---

### 📊 `helm/mlop-test/` — Helm Chart

Complete Kubernetes deployment package:

```
helm/mlop-test/
├── Chart.yaml       # Chart metadata
├── values.yaml      # Default configuration
├── files/           # Static assets
└── templates/       # K8s resource templates
    ├── api-*
    ├── frontend-*
    ├── postgres-*
    ├── ingress.yaml
    ├── namespace.yaml
    └── secret.yaml
```

**Deploys:** API • Frontend • PostgreSQL • Optional Ingress

---

### 📝 `k8s/manual/` — Kubernetes Manifests

Raw YAML manifests for manual deployment:

- `api-configmap.yaml` — API configuration
- `api-deployment.yaml` — API replica set
- `api-service.yaml` — Service exposure
- `frontend-deployment.yaml` — Frontend replicas
- `frontend-service.yaml` — Frontend exposure
- `postgres-deployment.yaml` — Database
- `postgres-service.yaml` — Database access
- `namespace.yaml` — Isolated namespace
- `secret.yaml` — Credentials management
- `ingress.yaml` — External routing

---

### ⚙️ `Dockerfile` Examples

Build strategy demonstrations:

| Strategy | File | Use Case |
|----------|------|----------|
| **Bad** | `Dockerfile.bad` | Common inefficiencies (educational) |
| **Multistage** | `Dockerfile.multistage` | Intermediate build optimization |
| **Optimized** | `Dockerfile.optimized` | Production best practices |



---

## 💻 Local Development with Docker Compose

### ▶️ Start the Stack

```bash
docker compose up --build
```

**What gets deployed:**
- API on `http://localhost:8080`
- Frontend on `http://localhost:8080`
- PostgreSQL on `localhost:5432`

### 🌍 Access the Application

Open in your browser:

```
http://localhost:8080
```

### 🔗 Available Endpoints

| Endpoint | Response |
|----------|----------|
| `GET /` | Service metadata |
| `GET /health` | Service health status |
| `GET /db` | Database connectivity check |

### ⏹️ Stop the Stack

```bash
docker compose down
```

**Clean up volumes too:**
```bash
docker compose down -v
```

---

## ▶️ Building & Running

### 🏃 Run the API Directly

#### Install Dependencies

```bash
cd app
npm install
```

#### Start the Server

```bash
npm start
```

#### With Database Configuration

```bash
PORT=8080 \
  DB_HOST=postgres \
  DB_USER=postgres \
  DB_PASSWORD=postgres \
  DB_NAME=postgres \
  DB_PORT=5432 \
  npm start
```

---

### 🐋 Build Docker Image

#### Example Build with Dockerfile.bad

```bash
docker build -f Dockerfile.bad -t lab3-api:bad .
```

#### Run the Container

```bash
docker run --rm -p 8080:8080 lab3-api:bad
```

#### Test with curl

```bash
curl http://localhost:8080
curl http://localhost:8080/healthz
```

---

## 🚀 Kubernetes Deployment

### 📦 Helm Deployment (Recommended)

#### Install the Helm Chart

```bash
helm install mlop-test \
  helm/mlop-test \
  --namespace mlop-test-helm \
  --create-namespace
```

#### Verify Deployment

```bash
kubectl get all -n mlop-test-helm
kubectl logs -n mlop-test-helm -l app=api
```

#### Uninstall

```bash
helm uninstall mlop-test --namespace mlop-test-helm
```

**Note:** Default ingress host is `mlop.local` (configured in `values.yaml`)

---

### 📋 Manual Kubernetes Deployment

#### Apply Manifests

```bash
kubectl apply -f k8s/manual
```

#### Check Status

```bash
kubectl get pods
kubectl get svc
```

#### Port Forward to Access

```bash
kubectl port-forward svc/api 8080:8080
```

---

## 🔄 Full Reset (IMPORTANT FOR LABS)

Use this before demos to ensure a clean state.

### 🧹 Complete Reset Script

```bash
#!/bin/bash

echo "🗑️  Deleting Kind cluster..."
kind delete cluster || true

echo "🧼 Cleaning Docker system..."
docker system prune -a --volumes -f

echo "🏗️  Recreating Kind cluster..."
kind create cluster --config kind-config.yaml

echo "📥 Installing Ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

echo "⏳ Waiting for Ingress to be ready (90s)..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

echo "📦 Installing Argo CD..."
kubectl create namespace argocd || true
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "🔄 Applying Application manifest..."
kubectl apply -f argocd/application.yaml

echo "🔑 Getting Argo CD Admin Password..."
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d && echo

echo "✅ Reset complete!"
```

---

## 🔨 Jenkins & WSL Setup

### � Alternative: Install Jenkins with Helm

#### Add Jenkins Helm Repository

```bash
helm repo add jenkins https://charts.jenkins.io
helm repo update
```

#### Install Jenkins

```bash
kubectl create namespace jenkins

helm upgrade --install jenkins jenkins/jenkins \
  -n jenkins \
  -f helm/jenkins-values.yaml
```

#### Get Jenkins Admin Password

```bash
kubectl exec --namespace jenkins svc/jenkins -c jenkins -- \
  cat /run/secrets/additional/chart-admin-password && echo
```

#### Access Jenkins UI

```bash
# Port forward to access Jenkins
kubectl port-forward svc/jenkins 8080:80 -n jenkins

# Access at: http://localhost:8080
```

---

### 💻 WSL-Based Jenkins Agent Setup

```bash
sudo apt update
sudo apt install -y openjdk-21-jdk
java -version
```

### 📁 Step 2: Create Jenkins Agent Directory

```bash
mkdir -p /home/<your-user>/jenkins-agent
```

### 🔐 Step 3: Configure SSH

```bash
# Install and start SSH
sudo apt install -y openssh-server
sudo service ssh start

# Get the WSL IP address
hostname -I

# Edit SSH configuration
sudo vim /etc/ssh/sshd_config
# Ensure: PasswordAuthentication yes

# Restart SSH
sudo service ssh restart
sudo service ssh status
```

### 🔑 Step 4: Add SSH Credentials in Jenkins UI

1. Navigate to **Manage Jenkins** → **Credentials**
2. Click **Add Credentials**
3. Fill in the form:
   - **Kind:** Username with password
   - **Scope:** Global
   - **Username:** Your WSL username
   - **Password:** Your WSL password
   - **ID:** `wsl-ssh`
4. Click **Save**

### 🖥️ Step 5: Add WSL as a Jenkins Node

1. Go to **Manage Jenkins** → **Nodes**
2. Click **New Node**
3. Enter Node name: `wsl-docker`
4. Select **Permanent Agent**
5. Configure:
   - **Description:** WSL-based Docker Agent
   - **Remote root directory:** `/home/<your-user>/jenkins-agent`
   - **Labels:** `wsl-docker` `wsl` `docker`
   - **Launch method:** Launch agents via SSH
   - **Host:** Use the WSL IPv4 address from Step 3
   - **Credentials:** Select `wsl-ssh`
   - **Host Key Verification Strategy:** Non verifying
6. Click **Save**

### ✅ Jenkins Setup Summary

Your Jenkins environment should have:

| Component | Version/Details |
|-----------|-----------------|
| **Jenkins Controller** | Accessible from your environment |
| **Agent Name** | `wsl-docker` (WSL-based, SSH) |
| **Java** | OpenJDK 21 |
| **Docker** | Integrated with WSL |
| **Remote Root** | `/home/<user>/jenkins-agent` |

**Credentials Added:**
- `wsl-ssh` — WSL SSH access
- `ghcr-creds` — GitHub Container Registry (optional)
- `git-creds` — Git credentials (optional)

**Jenkinsfile Usage:**
```groovy
pipeline {
    agent { label 'wsl-docker' }
    // ... rest of pipeline
}
```

---

## 📌 Implementation Notes

- **Docker Compose:** Uses `nginx/` container as reverse proxy (frontend served by nginx)
- **Helm:** Primary deployment artifact for production Kubernetes deployments
- **init-helm-lab/:** Minimal Helm chart example for learning basics
- **ArgoCD:** Supports GitOps-based deployments for continuous delivery

---

## 📚 Additional Resources

Learn more about the technologies used in this project:

- **[Docker Documentation](https://docs.docker.com/)** — Container fundamentals
- **[Kubernetes Documentation](https://kubernetes.io/docs/)** — Container orchestration
- **[Helm Documentation](https://helm.sh/docs/)** — Kubernetes package management
- **[Kind](https://kind.sigs.k8s.io/)** — Local Kubernetes cluster for testing
- **[Argo CD](https://argo-cd.readthedocs.io/)** — GitOps continuous delivery
- **[Jenkins](https://www.jenkins.io/doc/)** — CI/CD automation
- **[PostgreSQL](https://www.postgresql.org/docs/)** — Database documentation
- **[Express.js](https://expressjs.com/)** — Node.js web framework

---

## 🤝 Contributing

Found an issue or want to improve something? Feel free to submit feedback!

---

## 📄 License

This project is provided as-is for educational and demonstration purposes.

---

<div align="center">

**Made for learning MLOps, CI/CD, and container orchestration** 🚀

*Happy deploying!*

</div>