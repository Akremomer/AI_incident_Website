# API Notes

## Incidents

### `GET /api/incidents`
Returns the current incident list.

### `POST /api/incidents`
Creates a new incident with title, description, and severity.

### `POST /api/incidents/:id/analyze`
Adds a mock analysis payload to an incident.
