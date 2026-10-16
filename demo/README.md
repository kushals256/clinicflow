# Demo artifacts (MANDATORY for M10)

Grading evidence screenshots (M1–M9 + destroy) are in [`screenshots/`](screenshots/) — see [`screenshots/INDEX.md`](screenshots/INDEX.md) and [`screenshots/COST-CONTROL.md`](screenshots/COST-CONTROL.md).

Place the following files in this folder before submission:

1. **Presentation video** — [`presentation.mp4`](presentation.mp4) (~13 min; compressed from the screen recording for GitHub’s 100MB limit)
2. **Slide deck** — [`slides.pdf`](slides.pdf) (source: [`slides.html`](slides.html))

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

## PPT checklist (≥8 slides — deck has 16)

Source: [`slides.html`](slides.html) → rendered [`slides.pdf`](slides.pdf)

1. Title  
2. Agenda  
3. Project overview  
4. Features & API  
5. Tech stack  
6. Architecture  
7. Repository layout  
8. CI/CD flow  
9. DevSecOps / Trivy  
10. Terraform / AWS  
11. Kubernetes / Helm  
12. Argo CD GitOps  
13. Observability  
14. Evidence & cost control  
15. Key learnings  
16. Demo & submission  

Regenerate PDF after editing HTML:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$(pwd)/demo/slides.pdf" \
  "file://$(pwd)/demo/slides.html"
``` 

## Trivy notes (M6 write-up)

Trivy scanned the ClinicFlow backend and frontend container images in GitHub Actions for HIGH and CRITICAL vulnerabilities (`--ignore-unfixed --exit-code 1`). A clean result means no unfixed high/critical CVEs were found in the image layers at scan time. If findings appear, document one CVE ID, its package, and how you remediated or accepted the risk (for example by upgrading the base image).

## Trivy finding fixed in CI

First CI run failed Trivy on HIGH CVEs in `starlette 0.41.3` (CVE-2025-62727, CVE-2026-48818, CVE-2026-54283).  
Remediation: upgraded FastAPI to `0.143.2` (pulls Starlette >= 1.3.1). Re-run pipeline should be clean or document remaining findings.
