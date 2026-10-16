# Submission screenshots (ClinicFlow / kushals256)

Evidence for grading modules M1–M9 (plus destroy for M7 cost control).

| File | Module | Evidence |
|------|--------|----------|
| `01-pytest-v.png` | M2 | `pytest -v` |
| `02-docker-compose-ps.png` | M4 | Compose services |
| `03-nonroot-users.png` | M4 | Non-root containers |
| `04-metrics-endpoint.png` / `08-metrics-browser.png` | M9 | `/metrics` |
| `05-health-endpoint.png` | M1 | `/health` |
| `06-clinicflow-ui-*.png` | M1/M4 | App at localhost:3000 |
| `07-swagger-docs.png` | M1 | OpenAPI `/docs` |
| `09-github-commits.png` | M3 | ≥10 commits |
| `10-actions-run-browser.png` | M5 | Green Actions run |
| `11-ghcr-sha-tags.png` | M5 | GHCR SHA tags |
| `12-trivy-scan.png` | M6 | Trivy CI log |
| `13-terraform-plan.png` | M7 | `terraform plan` |
| `14-terraform-apply.png` | M7 | Apply complete |
| `14b-terraform-destroy.png` | M7 | Destroy complete |
| `16-eks-console.png` / `16-vpc-console.png` | M7 | EKS ACTIVE + VPC |
| `17-kubectl-nodes.png` | M8 | Ready nodes |
| `18-kubectl-clinicflow.png` | M8 | pods/svc/ingress/hpa |
| `19-helm-list.png` | M8 | Helm releases |
| `20-monitoring-pods.png` | M9 | Prometheus/Grafana pods |
| `21-ingress.png` | M8 | Ingress + NLB |
| `22-metrics-endpoint.png` | M9 | In-cluster `/metrics` |
| `23-prometheus-targets.png` | M9 | App target UP |
| `24-grafana-dashboard.png` | M9 | Grafana + ClinicFlow dashboard |
| `25-argocd-synced.png` | M10/video | Argo CD Synced |

See also [`COST-CONTROL.md`](COST-CONTROL.md). AWS ClinicFlow stack was destroyed after evidence capture.
