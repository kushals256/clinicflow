# Submission screenshots (local evidence)

Captured for username **kushals256** / ClinicFlow.

| File | Covers |
|------|--------|
| `01-pytest-v.png` | M2 — pytest -v all passed |
| `02-docker-compose-ps.png` | M4 — three services running |
| `03-nonroot-users.png` | M4 — non-root container users |
| `04-metrics-endpoint.png` | M9 — `/metrics` sample |
| `05-health-endpoint.png` | M1 — `/health` |
| `06-clinicflow-ui-desktop.png` | M1/M4 — app at localhost:3000 |
| `06-clinicflow-ui-localhost-3000.png` | M1 — alternate UI capture |
| `07-swagger-docs.png` | M1 — REST API surface |
| `08-metrics-browser.png` | M9 — metrics in browser |

## Still need YOU to capture (cannot do without your cloud accounts)

| Evidence | How |
|----------|-----|
| GitHub Actions green run | Push to your public repo `main` |
| GHCR packages with SHA tags | After CI push |
| Trivy scan log | From Actions job |
| `terraform plan` / AWS VPC+EKS / `destroy` | Run Terraform with your AWS account |
| `kubectl get pods/svc`, `helm list`, Ingress browser | After EKS + Helm |
| Prometheus Targets UP | After monitoring install |
| Grafana live panel | After monitoring install |
| Argo CD Synced | After Argo CD install |
| Commit history (≥10 commits) | After you push history |

| `09-github-commits.png` | M3 — ≥10 meaningful commits |
| `10-actions-green.png` / `10-actions-run-browser.png` | M5 — green Actions |
| `11-ghcr-sha-tags.png` | M5 — GHCR SHA tags |

Green run: https://github.com/kushals256/clinicflow/actions/runs/38879222308
