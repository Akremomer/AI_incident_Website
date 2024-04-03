# AI Incident Intelligence Platform

AI Incident Intelligence Platform is a multi-service incident response workspace for triage, analysis, and operational visibility. It combines a React dashboard, a local Node server, a Python AI analysis service, and a Go API layer intended for orchestration and persistence.

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- FastAPI
- Go + Gin + GORM
- PostgreSQL
- Docker Compose
- Kubernetes

## Features

- Incident dashboard with live filtering and expandable detail panels
- Local incident ingestion workflow for demos and rapid iteration
- AI-powered incident analysis endpoint with structured recommendations
- Go backend routes for listing, creating, updating, and analyzing incidents
- Container and Kubernetes deployment scaffolding
- CI workflow for frontend, AI service, and backend validation

## Screenshots

- `[Placeholder] Dashboard overview`
- `[Placeholder] Incident detail panel`
- `[Placeholder] AI analysis result`

## Project Structure

- `src/`: React frontend
- `server.ts`: local Node development server and mock API
- `ai-service/`: FastAPI-based incident analysis service
- `backend/`: Go API service
- `infra/`: Docker Compose and Kubernetes manifests
- `docs/`: architecture, API, and deployment notes

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Go 1.21+
- Docker and Docker Compose

### Install Dependencies

```bash
npm install
cd ai-service && pip install -r requirements.txt
cd ../backend && go mod download
```

### Run Locally

```bash
npm run dev
```

For the AI service:

```bash
cd ai-service
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

For the Go backend:

```bash
cd backend
go run .\cmd\api
```

### Docker Compose

```bash
docker-compose -f infra/docker/docker-compose.yml up --build
```
