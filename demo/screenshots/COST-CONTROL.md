# Cost control — destroy after demo

ClinicFlow AWS resources (`clinicflow-vpc`, `clinicflow-eks`, NAT Gateway, 2× t3.medium nodes) bill while running.

**Plan for this session**
1. `terraform apply` → capture plan/apply + AWS Console + kubectl/helm/Prometheus/Grafana/Argo CD screenshots
2. Immediately run `terraform destroy -auto-approve` in `terraform/`
3. Confirm: `aws eks list-clusters --region ap-south-1` has no `clinicflow-eks`
4. Capture destroy completion screenshot as `14b-terraform-destroy.png`

Do **not** leave the cluster overnight.
