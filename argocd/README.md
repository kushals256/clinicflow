# Argo CD — ClinicFlow GitOps

GRADING / SUBMISSION video requirements include showing a synced Argo CD application.

## Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open https://localhost:8080 (user `admin`).

## Point Argo CD at this repo

1. Edit `argocd/application.yaml` if needed:
   - `repoURL` is set for `https://github.com/kushals256/clinicflow.git` (change if your repo name differs)
   - images use `ghcr.io/kushals256/clinicflow-*`
   - tags → the CI commit SHA you want deployed
2. Apply:

```bash
kubectl apply -f argocd/application.yaml
```

3. In the Argo CD UI, show **Synced** / **Healthy** for `clinicflow`.

## GitOps flow

```text
git push → GitHub Actions builds/scans/pushes SHA image
       → update tag in Application / values (or commit SHA)
       → Argo CD syncs Helm chart to the cluster
```
