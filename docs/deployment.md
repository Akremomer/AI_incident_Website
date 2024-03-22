# Deployment Guide

## Docker Development
To start the entire stack locally:
```bash
docker-compose -f infra/docker/docker-compose.yml up --build
```

Frontend-only development is also supported with:
```bash
npm run dev
```

## Kubernetes Deployment

### 1. Create Namespace
```bash
kubectl create namespace ai-ops
```

### 2. Configure Secrets
```bash
kubectl create secret generic db-secrets --from-literal=url=postgres://... -n ai-ops
kubectl create secret generic ai-secrets --from-literal=api-key=YOUR_KEY -n ai-ops
```

### 3. Apply Manifests
```bash
kubectl apply -f infra/kubernetes/ -n ai-ops
```

## CI/CD Pipeline
The platform uses GitHub Actions (see `.github/workflows/ci.yml`) to:
1. Run Go tests and linting.
2. Run Python tests and linting.
3. Build Docker images.
4. Push to Container Registry.
5. Deploy to K8s (Staging/Prod).

## Troubleshooting

- Confirm `AI_SERVICE_URL` points to the FastAPI service before triggering backend analysis.
- Check that Postgres is reachable before starting the Go API locally.
