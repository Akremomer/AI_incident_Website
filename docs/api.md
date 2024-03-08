# API Documentation

## Incident Endpoints

### List Incidents
`GET /api/incidents`
Alias: `GET /api/v1/incidents`
Returns a list of all incidents.

### Create Incident
`POST /api/incidents`
Alias: `POST /api/v1/incidents`

### Get Incident Details
`GET /api/incidents/:id`
Alias: `GET /api/v1/incidents/:id`

### Update Incident
`PUT /api/incidents/:id`
Alias: `PUT /api/v1/incidents/:id`

### Trigger AI Analysis
`POST /api/incidents/:id/analyze`
Alias: `POST /api/v1/incidents/:id/analyze`

## AI Service Endpoints

### Analyze Payload
`POST /analyze`

### Health Check
`GET /health`
