# ClinicFlow Terraform — AWS VPC + EKS

This folder provisions the AWS network and EKS cluster used by ClinicFlow.

## Prerequisites

- Terraform >= 1.7
- AWS credentials configured via CLI/env (never commit keys)

## Commands

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Configure kubectl:

```bash
aws eks update-kubeconfig --region ap-south-1 --name clinicflow-eks
```

Tear down when finished (important for cost control):

```bash
terraform destroy
```
