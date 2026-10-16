# ClinicFlow — DevOps Final Capstone

**ClinicFlow** is a clinic appointment management application with a full DevSecOps delivery path: local Docker Compose → GitHub Actions (pytest, Trivy, GHCR) → Terraform (AWS VPC + EKS) → Helm / Argo CD → Prometheus + Grafana.

| | |
|---|---|
| **Repository** | https://github.com/kushals256/clinicflow |
| **Domain** | Original clinic appointments SaaS (not TaskBoard) |
| **Region (demo)** | `ap-south-1` (Mumbai) |
| **Submission form** | https://forms.gle/XWAP1vAumDJgAPM1A |
| **Deadline** | Sunday, 19 October 2026, 11:59 PM IST |

This README is the technical documentation required for **M10**. Grading rubric: [`GRADING.md`](GRADING.md). Submission rules: [`SUBMISSION.md`](SUBMISSION.md).

---

## Table of contents

1. [Project purpose](#1-project-purpose)
2. [Architecture](#2-architecture)
3. [Tech stack](#3-tech-stack)
4. [Repository structure](#4-repository-structure)
5. [Local setup](#5-local-setup)
6. [Application & API](#6-application--api)
7. [Testing](#7-testing)
8. [Docker](#8-docker)
9. [CI/CD](#9-cicd)
10. [DevSecOps (Trivy)](#10-devsecops-trivy)
11. [Terraform (AWS)](#11-terraform-aws)
12. [Kubernetes & Helm](#12-kubernetes--helm)
13. [Argo CD (GitOps)](#13-argo-cd-gitops)
14. [Observability](#14-observability)
15. [Demo & submission (M10)](#15-demo--submission-m10)
16. [Known issues & limitations](#16-known-issues--limitations)

---

## 1. Project purpose

ClinicFlow lets clinic staff manage patient appointments end-to-end:

- Create, list, update, and cancel appointments
- View simple stats (counts by status / priority)
- Run the same app locally (Compose) and on Kubernetes (Helm)

The DevOps layer demonstrates professional practices from Session 21: containerization, gated CI, image scanning, infrastructure as code, cluster packaging, GitOps, and metrics-based observability — with **mandatory `terraform destroy`** after evidence capture to control AWS cost.

---

## 2. Architecture

### High-level delivery path

```text
Developer
   │
   ▼
GitHub (main)
   │
   ▼
GitHub Actions
   ├── pytest + frontend build
   ├── Docker build (backend + frontend)
   ├── Trivy (fail on HIGH/CRITICAL, ignore-unfixed)
   └── Push images → GHCR (tag = git SHA)
              │
              ▼
        Terraform → AWS VPC + EKS
              │
              ▼
        Argo CD / Helm (clinicflow namespace)
              │
      ┌───────┴────────┐
      ▼                ▼
  Frontend          Backend
   React/Nginx       FastAPI
      │                │
      └───────► PostgreSQL
                   │
            /metrics ──► Prometheus ──► Grafana
```

### Runtime request path (Kubernetes)

```text
Client
  → Ingress (nginx)  /          → Frontend Service → Frontend pods
  → Ingress (nginx)  /api       → Backend Service  → Backend pods
  → Backend                       → Postgres Service → Postgres pod
  → Backend /metrics              → Prometheus scrape (ServiceMonitor or static job)
```

### Local request path (Docker Compose)

```text
Browser :3000 → frontend (Nginx) → proxies /api → backend :8000 → postgres :5432
Optional: prometheus :9091 scrapes backend; grafana :3300 visualizes metrics
```

---

## 3. Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React, Vite, Nginx (non-root container) |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic, Prometheus client |
| Database | PostgreSQL 16 |
| Testing | Pytest (SQLite test DB, not production Postgres) |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions → GitHub Container Registry (GHCR) |
| Security | Trivy image scanning (`HIGH`/`CRITICAL`, `--exit-code 1`) |
| IaC | Terraform + AWS modules (VPC + EKS) |
| Kubernetes | Deployments, ClusterIP Services, Ingress, HPA, ServiceMonitor |
| Packaging | Helm chart `helm/clinicflow` |
| GitOps | Argo CD Application (`argocd/application.yaml`) |
| Observability | Prometheus, Grafana, `/metrics` |

---

## 4. Repository structure

```text
├── frontend/                      # React + Vite UI + multi-stage Dockerfile
├── backend/                       # FastAPI, Alembic, pytest, Dockerfile
│   ├── app/                       # models, schemas, routes, DB, metrics
│   ├── alembic/versions/          # DB migrations
│   └── tests/                     # API tests
├── docker-compose.yml             # Local: postgres + backend + frontend
├── docker-compose.monitoring.yml  # Local: Prometheus + Grafana (M9 screenshots)
├── terraform/                     # AWS VPC + EKS (ap-south-1)
├── helm/clinicflow/               # Application Helm chart
├── k8s/                           # Namespace / bootstrap manifests
├── argocd/                        # Argo CD Application CR
├── monitoring/                    # Cluster Helm values + local Prom/Grafana config
├── troubleshooting/               # Broken image/service labs
├── scripts/                       # Load-test helper for HPA demos
├── demo/                          # slides.pdf + presentation video (M10) + screenshots/
├── GRADING.md                     # Rubric
├── SUBMISSION.md                  # Deadline + form + video rules
└── .github/workflows/ci-cd.yml    # CI/CD pipeline
```

---

## 5. Local setup

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Free host ports: **3000** (UI), **8000** (API), **5432** (Postgres)
- Optional for monitoring overlay: **9091** (Prometheus), **3300** (Grafana)
- Optional for cluster work: `kubectl`, `helm`, AWS CLI, Terraform ≥ 1.5

### Start the full stack

```bash
git clone https://github.com/kushals256/clinicflow.git
cd clinicflow
docker compose up --build
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | ClinicFlow UI |
| http://localhost:8000/docs | OpenAPI / Swagger |
| http://localhost:8000/health | Liveness |
| http://localhost:8000/ready | Readiness (DB) |
| http://localhost:8000/metrics | Prometheus metrics |

Stop:

```bash
docker compose down
docker compose down -v   # also delete the Postgres volume
```

### Backend only (without Compose)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://clinicflow:clinicflow@localhost:5432/clinicflow'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Copy env template if needed: [`backend/.env.example`](backend/.env.example). **Never commit real secrets.**

### Local observability (no AWS)

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

| URL | Credentials / notes |
|-----|---------------------|
| http://localhost:9091/targets | Expect `clinicflow-backend` **UP** |
| http://localhost:3300 | `admin` / `clinicflow` → **ClinicFlow Application** dashboard |

---

## 6. Application & API

### Features

- Appointment CRUD with patient name, doctor, reason, priority, status, and time
- Stats endpoint for dashboard-style summaries
- Health / readiness probes for Compose and Kubernetes
- Prometheus-formatted metrics for request volume and latency

### REST endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Create appointment |
| `GET` | `/api/appointments/{id}` | Get one |
| `PUT` | `/api/appointments/{id}` | Update |
| `DELETE` | `/api/appointments/{id}` | Delete |
| `GET` | `/api/appointments/stats` | Aggregates |
| `GET` | `/health` | Liveness |
| `GET` | `/ready` | Readiness |
| `GET` | `/metrics` | Prometheus scrape |

Database schema is managed with **Alembic** under `backend/alembic/versions/`.

---

## 7. Testing

```bash
cd backend
pytest -v
```

| Requirement | How ClinicFlow meets it |
|-------------|-------------------------|
| Pytest runs cleanly | `backend/pytest.ini` + `backend/tests/` |
| ≥5 cases / ≥3 endpoints | CRUD + stats coverage in `test_api.py` |
| Isolated DB | Tests use SQLite (`sqlite:///./test.db`), not production Postgres |

CI runs `pytest` **before** any image build or push.

---

## 8. Docker

| Artifact | Notes |
|----------|--------|
| [`backend/Dockerfile`](backend/Dockerfile) | Python 3.12 image, non-root user, exposes `8000` |
| [`frontend/Dockerfile`](frontend/Dockerfile) | Multi-stage: Node build → Nginx runtime, non-root, port `8080` |
| [`docker-compose.yml`](docker-compose.yml) | `postgres` + `backend` + `frontend` with healthcheck wiring |

Verify non-root at runtime:

```bash
docker compose exec backend id
docker compose exec frontend id
```

---

## 9. CI/CD

**Workflow:** [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

**Triggers:** push and pull request to `main`.

### Pipeline stages

```text
push/PR → main
    │
    ▼
[test]
  • setup Python 3.12 → pip install → pytest
  • setup Node 22 → npm install → npm run build
    │
    ▼  (push to main only)
[build-scan-push]
  • docker build backend + frontend (tag = github.sha)
  • trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1
  • docker push → GHCR
```

### Image tags

```text
ghcr.io/kushals256/clinicflow-backend:<git-sha>
ghcr.io/kushals256/clinicflow-frontend:<git-sha>
```

Packages should be **public** (or grader access granted). After the first push: GitHub → Packages → package settings → Change visibility → Public.

Authentication uses `GITHUB_TOKEN` via `docker/login-action` — no long-lived registry passwords in the repo.

---

## 10. DevSecOps (Trivy)

Trivy scans both images in CI:

```bash
trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 <image>
```

- Fail-closed on unfixed HIGH/CRITICAL CVEs
- Example remediation already applied: FastAPI bumped so Starlette pulls a fixed release (see [`demo/README.md`](demo/README.md))
- Evidence: Actions log screenshot under `demo/screenshots/12-trivy-scan.png`

---

## 11. Terraform (AWS)

Directory: [`terraform/`](terraform/)  
Example vars: [`terraform/terraform.tfvars.example`](terraform/terraform.tfvars.example)

### What it provisions

| Resource | Detail |
|----------|--------|
| VPC | `clinicflow-vpc`, CIDR `10.20.0.0/16` |
| Subnets | 2 public + 2 private across AZs `a`/`b` |
| NAT | Single NAT gateway for private egress |
| EKS | Cluster `clinicflow-eks`, Kubernetes `1.31` |
| Node group | Managed `t3.medium`, desired 2 (min 2 / max 4) |
| Region | Default `ap-south-1` |

### Commands

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # edit region/name if needed
terraform init
terraform plan
terraform apply

aws eks update-kubeconfig --region ap-south-1 --name clinicflow-eks

# After screenshots / evaluation — mandatory cost control
terraform destroy
```

**Never commit AWS access keys, secret keys, or `terraform.tfvars` with credentials.** Use IAM roles or short-lived env vars locally only.

Evidence captured for grading lives under [`demo/screenshots/`](demo/screenshots/) (plan, apply, Console VPC/EKS, destroy). The ClinicFlow AWS stack was destroyed after evidence capture.

---

## 12. Kubernetes & Helm

### Bootstrap

```bash
kubectl apply -f k8s/namespace.yaml
```

### Deploy with Helm

Chart: [`helm/clinicflow/`](helm/clinicflow/)

Includes:

- Frontend + backend Deployments (`replicaCount` default **2**)
- ClusterIP Services
- Optional Ingress (`/` → frontend, `/api` → backend)
- HorizontalPodAutoscaler (CPU target)
- In-cluster Postgres (demo; emptyDir/PVC per values)
- ServiceMonitor when Prometheus Operator is present

```bash
# Prerequisites on the cluster:
# - ingress-nginx (or equivalent)
# - metrics-server (for HPA)

helm upgrade --install clinicflow ./helm/clinicflow \
  --namespace clinicflow \
  --create-namespace \
  -f helm/clinicflow/values-dev.yaml \
  --set backend.image=ghcr.io/kushals256/clinicflow-backend \
  --set frontend.image=ghcr.io/kushals256/clinicflow-frontend \
  --set backend.tag=<GIT_SHA> \
  --set frontend.tag=<GIT_SHA>
```

### Verify

```bash
kubectl get pods -n clinicflow
kubectl get svc -n clinicflow
kubectl get ingress -n clinicflow
kubectl get hpa -n clinicflow
helm list -n clinicflow
```

Load generation for HPA demos: [`scripts/load-test.sh`](scripts/load-test.sh).

---

## 13. Argo CD (GitOps)

Manifest: [`argocd/application.yaml`](argocd/application.yaml)

- Source: this GitHub repo, path `helm/clinicflow`, revision `main`
- Destination: cluster `clinicflow` namespace
- Sync: automated prune + self-heal

```bash
# Install Argo CD once, then:
kubectl apply -f argocd/application.yaml
```

Update `backend.tag` / `frontend.tag` to the CI-published git SHA for immutable deploys. Presentation should show the Application **Synced** / **Healthy** (see `demo/screenshots/25-argocd-synced.png`).

---

## 14. Observability

### Metrics contract

The FastAPI backend exposes Prometheus text at **`GET /metrics`** (request counters and latency histograms).

### On Kubernetes (kube-prometheus-stack)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/prometheus-values.yaml \
  -f monitoring/grafana-values.yaml

kubectl apply -f monitoring/grafana-dashboard-configmap.yaml
```

- Helm `ServiceMonitor` scrapes the ClinicFlow backend Service when enabled
- Dashboard: HTTP request rate + p95 latency (`monitoring/clinicflow-dashboard.json`)

Port-forward:

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80
```

Confirm:

1. Prometheus **Status → Targets** — application job **UP**
2. Grafana — ClinicFlow dashboard with live series (generate traffic first)

### Local Compose monitoring (no cluster)

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

Config:

- [`monitoring/prometheus-local.yml`](monitoring/prometheus-local.yml) — scrape `backend:8000/metrics`
- [`monitoring/grafana-provisioning/`](monitoring/grafana-provisioning/) — Prometheus datasource + dashboard provider
- UI ports: Prometheus **9091**, Grafana **3300**

Evidence screenshots: `demo/screenshots/23-prometheus-targets.png`, `24-grafana-dashboard.png`.

---

## 15. Demo & submission (M10)

| Artifact | Location | Status |
|----------|----------|--------|
| Technical README | this file | required |
| Slide deck (≥8 slides) | [`demo/slides.pdf`](demo/slides.pdf) | required |
| Presentation video (MP4) | `demo/presentation.mp4` (or similar) | **mandatory** |
| Evidence screenshots | [`demo/screenshots/`](demo/screenshots/) | supporting |

**Submit** the public GitHub URL via: https://forms.gle/XWAP1vAumDJgAPM1A  

Video must cover (in order): PPT → codebase → CI/CD → Terraform/AWS → Argo CD → Kubernetes → Prometheus UP → Grafana panels. Details: [`demo/README.md`](demo/README.md), [`SUBMISSION.md`](SUBMISSION.md).

---

## 16. Known issues & limitations

- In-cluster PostgreSQL is for classroom/demo only; production should use managed Postgres (e.g. Amazon RDS).
- Frontend Nginx proxies `/api` to hostname `backend` for Compose; on Kubernetes prefer Ingress `/api` routing to the backend Service.
- HPA needs Metrics Server and real CPU load (`scripts/load-test.sh`).
- Images publish to `ghcr.io/kushals256/clinicflow-*`. Update Argo CD `repoURL` / image names if the fork owner differs.
- EKS + NAT incurs cost quickly — always run **`terraform destroy`** after evaluation.
- M9 UI panels for submission were also validated on the local Compose monitoring stack after the AWS demo stack was destroyed.

---

## Troubleshooting lab

```bash
kubectl apply -f troubleshooting/broken-image.yaml
kubectl apply -f troubleshooting/broken-service.yaml
```

Investigate with `kubectl describe`, Events, and Endpoints (label selectors).

---

## License / academic use

Built for the DevSecOps Final Capstone (Session 21). Follow course academic integrity rules: original application domain, no plagiarism of another student’s submission.
