# Backend progress

## Current state

The backend is implemented as a standalone Express/Mongoose service for the Member 2 ownership area. The workspace did not contain a Git repository, frontend source, package manifest, or teammate implementation when this work started.

## Delivered

- Express app with CORS, Helmet, rate limiting, JSON limits, request logging, health check, and centralized errors.
- MongoDB/Mongoose models for users, memberships, organizations, projects, workspaces, events, incidents, attempts, and experiences.
- JWT authentication with bcrypt password hashing.
- Organization membership and project-level tenant isolation enforced from the authenticated user.
- Organization, project, workspace, event, incident, attempt, resolution, experience, and recall APIs.
- Secret redaction before Memory Agent calls.
- Final Member 3 Memory Agent adapter for RETAIN and RECALL with timeout, response validation, and safe fallbacks.
- A frontend contract documented in `README.md`.

## Integration assumptions

- Express calls only Member 3's Python Memory Agent through `MEMORY_API_URL`; it never calls Hindsight or Groq directly.
- The Memory Agent contract is `POST /memory/retain` and `POST /memory/recall`; direct backend REFLECT integration is intentionally absent.
- MongoDB is required for protected data APIs. The health endpoint reports database state without exposing connection details.

## Run

```bash
cd backend
npm install
cp .env.example .env
npm start
```

## Important API shapes

- `POST /api/auth/register` → `{ user, token }`
- `POST /api/auth/login` → `{ user, token }`
- `GET /api/auth/me` → `{ user, organizations }`
- `POST /api/organizations` → `{ organization }`
- `GET /api/projects?organizationId=...` → `{ projects }`
- `POST /api/incidents/:id/resolve` → `{ incident, experience, memory }`
- `POST /api/memory/recall` → stable `matches` and `recommendation` response

## Remaining work outside Member 2

- Member 1 should map the UI to the documented routes and send only meaningful engineering events.
- The Python Memory Agent must be running at the configured `MEMORY_API_URL` for live RETAIN/RECALL verification.
- The configured hostname is `https://mandate-scroll-tractor.ngrok-free.dev`, the complete Memory API URL.
- Live RETAIN returned `status: stored` for the synthetic backend test.
- Live RECALL returned HTTP 200 with a structured `recommendation.similar_incident`; the adapter maps that result into the stable frontend response shape.
- Member 4 can integrate incident intelligence by calling the incident/attempt APIs or by adding logic behind the existing resolution boundary.
- A running MongoDB instance and real provider secrets are needed for live persistence/provider verification.