# Engineering Memory Workspace API

This is the Member 2 backend for the company-based coding workspace shown in the product screens. The frontend talks to this service over HTTP; it never connects directly to MongoDB, Hindsight, Groq, or the Python Memory Agent.

## Run locally

```bash
cd backend
npm install
cp .env.example .env
# Start MongoDB, then set MONGO_URI/JWT_SECRET in .env
npm start
```

Health: `GET http://localhost:5000/api/health`

The current team frontend is Next.js and uses `http://localhost:3000` by default. Set `CLIENT_URL` to a comma-separated list when the frontend runs on more than one origin.

Protected endpoints use:

```http
Authorization: Bearer <token returned by register/login>
```

## Frontend contract

All responses use JSON. Successful collection responses are shaped as `{ success: true, ... }`. Errors are always:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Auth and company home

```text
POST /api/auth/register
  { "name": "Alice", "email": "alice@example.com", "password": "password123" }

POST /api/auth/login
  { "email": "alice@example.com", "password": "password123" }

GET /api/auth/me
POST /api/organizations
  { "name": "Acme Technologies", "description": "..." }
GET /api/organizations/:organizationId
GET /api/organizations/:organizationId/members
POST /api/organizations/:organizationId/members
  { "email": "bob@example.com", "role": "member" }
```

The register/login response contains `user` and `token`. The company home screen can call `/api/auth/me`, then list projects with the selected organization ID:

```text
GET /api/projects?organizationId=<organizationId>
```

### Projects and workspaces

```text
POST /api/projects
  { "organizationId": "...", "name": "E-Commerce Platform", "description": "...", "repositoryUrl": "...", "techStack": ["Node.js", "MongoDB"] }
GET /api/projects?organizationId=...
GET /api/projects/:projectId
PATCH /api/projects/:projectId
POST /api/projects/:projectId/workspaces
GET /api/projects/:projectId/workspaces
GET /api/workspaces/:workspaceId
```

### Incidents, attempts, and experiences

```text
POST /api/incidents
GET /api/incidents?projectId=...&status=open
GET /api/incidents/:incidentId
PATCH /api/incidents/:incidentId
POST /api/incidents/:incidentId/attempts
GET /api/incidents/:incidentId/attempts
POST /api/incidents/:incidentId/resolve
  { "solution": "...", "rootCause": "...", "verification": "...", "outcome": "resolved" }
GET /api/experiences?projectId=...
GET /api/experiences/:experienceId
```

Resolving an incident updates it, creates an Experience in MongoDB, then calls Member 3's `POST /memory/retain` endpoint through the adapter. The response reports `memory.retained: true` only when the agent returns `{ "status": "stored" }`. A Memory Agent outage does not erase the MongoDB experience.

### Engineering memory

```text
POST /api/memory/recall
  {
    "projectId": "...",
    "incidentId": "...",
    "problem": "Order API returns intermittent 500 errors",
    "errorMessage": "Internal Server Error",
    "service": "order-service",
    "language": "Node.js",
    "framework": "Express",
    "environment": "development",
    "version": "2.9.0",
    "status": "investigating",
    "attempts": []
  }
```

Recall scopes the request from JWT membership, sanitizes context, calls Member 3's `/memory/recall` endpoint, and normalizes only the returned `similar_experiences` and `recommendation`. If the agent is unavailable, the endpoint returns an empty match list; it never fabricates memories locally.

## Memory Agent handoff

The Express backend does not call Hindsight or Groq directly. `src/services/memory.service.js` calls only:

- `POST ${MEMORY_API_URL}/memory/retain`
- `POST ${MEMORY_API_URL}/memory/recall`

The checked-in Member 3 API runs at `http://127.0.0.1:8000` by default; set `MEMORY_API_URL` to the deployed Member 3 base URL when one is available. Both requests include `bank_id`, derived from the authenticated organization ID so each company's Hindsight bank remains isolated. RETAIN sends the required nested `incident` and `experience` objects; RECALL sends the full incident shape required by the agent. The adapter has a configurable 20-second default timeout, validates the required response shapes, redacts secrets, and degrades safely when the agent is unavailable. There is no backend REFLECT endpoint because Member 3 handles reasoning through RECALL → Groq.