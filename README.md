# ClinicFlow — DevOps Final Capstone

ClinicFlow is a clinic appointment management SaaS: book visits, track check-in status, and operate the full path from laptop → CI/CD → GHCR → AWS EKS → Helm/Argo CD → Prometheus/Grafana.

This is an original application domain (not TaskBoard). The DevOps architecture follows the Session 21 reference pattern.

## Architecture

```text
Developer
   |
   v
Git / GitHub
   |
   v
GitHub Actions
   |-- pytest
   |-- frontend build
   |-- Docker build
   |-- Trivy scan (fail on HIGH/CRITICAL)
   `-- push images to GHCR (SHA tags)
              |
              v
        Terraform → AWS VPC + EKS
              |
              v
        Argo CD / Helm
              |
      +-------+--------+
      |                |
   Frontend          Backend
    React            FastAPI
      |                |
      +-------> PostgreSQL
              |
       Prometheus → Grafana
```

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React, Vite, Nginx (non-root) |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 |
| Testing | Pytest |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions → GHCR |
| Security | Trivy image scanning |
| IaC | Terraform (VPC + EKS, `ap-south-1`) |
| Kubernetes | Deployments, Services, Ingress, HPA |
| Packaging | Helm (`helm/clinicflow`) |
| GitOps | Argo CD (`argocd/`) |
| Observability | Prometheus, Grafana, `/metrics` |

## Repository structure

```text
├── frontend/                 # React + Vite UI
├── backend/                  # FastAPI + Alembic + tests
├── docker-compose.yml        # Local full stack
├── terraform/                # AWS VPC + EKS
├── helm/clinicflow/          # Kubernetes package
├── k8s/                      # Namespace / bootstrap manifests
├── argocd/                   # Argo CD Application
├── monitoring/               # Prometheus + Grafana values + dashboard
├── troubleshooting/          # Broken image/service labs
├── scripts/                  # Load-test helper
├── demo/                     # Video + PPT (MANDATORY for M10)
└── .github/workflows/        # CI/CD
```

## Local setup (Docker Compose)

Requirements: Docker Desktop / Docker Engine + Compose.

```bash
docker compose up --build
# If your CLI has no Compose plugin, use: docker-compose up --build
```

> Tip: free host port **3000** before starting (another Node process may already bind it).

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | ClinicFlow UI |
| http://localhost:8000/docs | Swagger |
| http://localhost:8000/health | Liveness |
| http://localhost:8000/metrics | Prometheus metrics |

Stop:

```bash
docker compose down
# also remove DB volume:
docker compose down -v
```

### Backend API (direct)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://clinicflow:clinicflow@localhost:5432/clinicflow'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

REST endpoints:

```text
GET/POST          /api/appointments
GET/PUT/DELETE    /api/appointments/{id}
GET               /api/appointments/stats
GET               /health  /ready  /metrics
```

## Testing

```bash
cd backend
pytest -v
```

Tests use SQLite (`sqlite:///./test.db`), not the production PostgreSQL database. The CI pipeline runs pytest before any image is built or pushed.

## CI/CD pipeline

Workflow: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

Triggers on push/PR to `main`.

1. **test** — install deps, `pytest`, build frontend  
2. **build-scan-push** (push to `main` only) — build backend + frontend images, Trivy scan with `--severity HIGH,CRITICAL --ignore-unfixed --exit-code 1`, push to GHCR as:

```text
ghcr.io/<github-owner>/clinicflow-backend:<git-sha>
ghcr.io/<github-owner>/clinicflow-frontend:<git-sha>
```

Packages must be public (or grader access granted) for evaluation. After the first push, if packages are private: GitHub → Packages → package settings → Change visibility → Public.

### Trivy (M6)

Trivy scans both container images in CI for HIGH and CRITICAL vulnerabilities and fails the job when unfixed issues are found (`--exit-code 1`). A clean scan means no unfixed high/critical CVEs were detected in the image layers at that commit. Capture the Actions log screenshot for submission.

## Terraform infrastructure

See [`terraform/`](terraform/) and [`terraform/terraform.tfvars.example`](terraform/terraform.tfvars.example).

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Creates:

- VPC with **two public** and two private subnets  
- NAT gateway  
- EKS cluster `clinicflow-eks` with a managed node group  

```bash
aws eks update-kubeconfig --region ap-south-1 --name clinicflow-eks
terraform destroy   # after evaluation — avoid runaway cost
```

**Never commit AWS access keys.**

## Kubernetes / Helm

```bash
kubectl apply -f k8s/namespace.yaml

helm upgrade --install clinicflow ./helm/clinicflow \
  --namespace clinicflow \
  --create-namespace \
  -f helm/clinicflow/values-dev.yaml \
  --set backend.image=ghcr.io/kushals256/clinicflow-backend \
  --set frontend.image=ghcr.io/kushals256/clinicflow-frontend \
  --set backend.tag=<GIT_SHA> \
  --set frontend.tag=<GIT_SHA>
```

Verify:

```bash
kubectl get pods -n clinicflow
kubectl get svc -n clinicflow
helm list -n clinicflow
kubectl get ingress -n clinicflow
kubectl get hpa -n clinicflow
```

Ingress routes:

- `/` → frontend  
- `/api` → backend  

Install an Ingress Controller (e.g. ingress-nginx) and Metrics Server before demoing Ingress/HPA.

## Argo CD (GitOps)

See [`argocd/`](argocd/). Edit `argocd/application.yaml` with your repo URL and image tags, then:

```bash
kubectl apply -f argocd/application.yaml
```

Show the application **Synced** / **Healthy** in the Argo CD UI for the presentation video.

## Observability (Prometheus + Grafana)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/prometheus-values.yaml \
  -f monitoring/grafana-values.yaml

kubectl apply -f monitoring/grafana-dashboard-configmap.yaml
```

- Backend exposes Prometheus metrics at `/metrics`  
- Helm `ServiceMonitor` scrapes the backend Service  
- Import/sidecar loads the ClinicFlow dashboard (HTTP rate + p95 latency)  

Port-forward examples:

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80
```

Generate traffic, then confirm Prometheus target **UP** and a populated Grafana panel.

### Local stack (no cluster / no AWS)

For grading screenshots without EKS:

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

- Prometheus: http://localhost:9091/targets — `clinicflow-backend` should be **UP**
- Grafana: http://localhost:3300 — login `admin` / `clinicflow` (or anonymous Viewer) → **ClinicFlow Application** dashboard

## Troubleshooting lab

```bash
kubectl apply -f troubleshooting/broken-image.yaml
kubectl apply -f troubleshooting/broken-service.yaml
```

Investigate with `kubectl describe`, Events, and Endpoints (label selectors).

## Demo / submission (M10)

Deadline: **Sunday, 19 October 2026, 11:59 PM IST**  
Form: https://forms.gle/XWAP1vAumDJgAPM1A  

Required in this repo:

1. This `README.md`  
2. `demo/` presentation **video** (MP4) — mandatory  
3. `demo/` PPT or PDF (≥8 slides) — mandatory  

See [`demo/README.md`](demo/README.md), [`GRADING.md`](GRADING.md), and [`SUBMISSION.md`](SUBMISSION.md).

## Known issues / limitations

- In-cluster PostgreSQL with PVC is for classroom/demo; production should prefer Amazon RDS.  
- Frontend Nginx proxies `/api` to hostname `backend` for Docker Compose; Kubernetes traffic should use Ingress `/api` routing.  
- HPA requires Metrics Server and meaningful CPU load (`scripts/load-test.sh`).  
- Images publish to `ghcr.io/kushals256/clinicflow-*`. Update the Argo CD `repoURL` if your GitHub repo name differs from `clinicflow`.  
- Always run `terraform destroy` after evaluation to control AWS cost.
