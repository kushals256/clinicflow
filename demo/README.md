# Demo artifacts (MANDATORY for M10)

Grading evidence screenshots (M1–M9 + destroy) are in [`screenshots/`](screenshots/) — see [`screenshots/INDEX.md`](screenshots/INDEX.md) and [`screenshots/COST-CONTROL.md`](screenshots/COST-CONTROL.md).

Place the following files in this folder before submission:

1. **Presentation video** (MP4 preferred) — e.g. `demo/presentation.mp4` — still required
2. **Slide deck** — e.g. `demo/slides.pdf` (committed) or `demo/presentation.pptx`

## Video checklist (required order)

1. Present PPT slides (architecture + what you built)
2. Live walkthrough:
   - Codebase overview
   - CI/CD: push → green GitHub Actions run
   - Terraform: plan/apply + AWS Console VPC + EKS
   - Argo CD: Synced application / GitOps flow
   - Kubernetes: pods, services, ingress healthy
   - Prometheus: Targets page shows app **UP**
   - Grafana: live panel with application metrics

## PPT checklist (≥8 slides)

1. Project overview  
2. Tech stack  
3. Architecture diagram  
4. CI/CD flow  
5. Infrastructure (Terraform / AWS)  
6. Kubernetes / Helm setup  
7. Observability  
8. Key learnings  

## Trivy notes (M6 write-up)

Trivy scanned the ClinicFlow backend and frontend container images in GitHub Actions for HIGH and CRITICAL vulnerabilities (`--ignore-unfixed --exit-code 1`). A clean result means no unfixed high/critical CVEs were found in the image layers at scan time. If findings appear, document one CVE ID, its package, and how you remediated or accepted the risk (for example by upgrading the base image).

## Trivy finding fixed in CI

First CI run failed Trivy on HIGH CVEs in `starlette 0.41.3` (CVE-2025-62727, CVE-2026-48818, CVE-2026-54283).  
Remediation: upgraded FastAPI to `0.143.2` (pulls Starlette >= 1.3.1). Re-run pipeline should be clean or document remaining findings.
