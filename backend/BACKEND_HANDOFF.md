# Backend Handoff Report

Generated from the current workspace snapshot. This is the only file created in this handoff operation. No implementation, package installation, or test execution was performed for its creation.

## 1. Complete backend tree

```text
backend/
├── .env.example
├── .gitignore
├── BACKEND_PROGRESS.md
├── BACKEND_HANDOFF.md
├── README.md
├── package.json
└── src/ (app.js, server.js, config, controllers, middleware, models, routes, services, utils, validators; all files listed verbatim below)
```

## 2. Architecture and ownership

Member 2's Express/Mongoose service provides JWT authentication, organization/project/workspace tenancy, engineering events, incidents, attempts, experiences, and a Python Memory Agent adapter. The frontend uses HTTP/JSON and never connects directly to MongoDB, Hindsight, Groq, or the Python agent. Backend calls only Member 3's Memory API.

## 3. MongoDB schemas

- User: name, unique lowercase email, passwordHash (select:false), timestamps.
- Organization: name, description, createdBy, timestamps.
- Membership: userId, organizationId, role (admin/member), timestamps; unique userId+organizationId.
- Project: organizationId, name, description, repositoryUrl, techStack[], createdBy, timestamps.
- Workspace: organizationId, projectId, name, configuration, createdBy, timestamps.
- EngineeringEvent: organizationId, projectId, workspaceId, userId, sessionId, type, source, payload, timestamp, timestamps.
- Incident: organizationId, projectId, workspaceId, title, description, errorMessage, errorType, stackTrace, filePath, lineNumber, columnNumber, command, logs, language, framework, runtime, service, environment, version, recentChange, status (open/investigating/resolved), severity (low/medium/high/critical), createdBy, assignedTo, rootCause, resolution, resolvedAt, timestamps.
- Attempt: organizationId, projectId, incidentId, performedBy, action, result (failed/successful/inconclusive), notes, evidence, timestamps.
- Experience: organizationId, projectId, incidentId, problem, context, attempts, solution, rootCause, verification, outcome, retainedAt, retentionStatus (pending/retained/unavailable/failed), timestamps.

Relationships: organizations own memberships/projects; projects own workspaces/events/incidents/experiences; incidents own attempts and one experience; users own memberships and authored/assigned resources.

## 4. Complete API contract

All responses are JSON. Errors are { success:false, error:{ code, message } }. Protected routes require Authorization: Bearer <token>.

### Public
- GET /api/health — no body; response { success:true, message, database:connected|disconnected, integrations:{memoryApi:boolean} }.
- POST /api/auth/register — body {name,email,password}; 201 response {success:true,user:{id,name,email,createdAt},token}.
- POST /api/auth/login — body {email,password}; response {success:true,user:{id,name,email,createdAt},token}.

### Auth/company
- GET /api/auth/me — response {success:true,user,organizations:[...]}.
- POST /api/organizations — body {name,description?}; 201 response {success:true,organization,role:admin}.
- GET /api/organizations/:organizationId — response {success:true,organization,stats:{memberCount,projectCount}}.
- GET /api/organizations/:organizationId/members — response {success:true,members:[...]}.
- POST /api/organizations/:organizationId/members — body {email,role}; 201 response {success:true,membership}.

### Projects/workspaces
- POST /api/projects — body {organizationId,name,description?,repositoryUrl?,techStack?}; 201 response {success:true,project}.
- GET /api/projects?organizationId=... — response {success:true,projects:[...]}; without organizationId lists projects in the user's organizations.
- GET /api/projects/:projectId — response {success:true,project}.
- PATCH /api/projects/:projectId — body subset of project fields; response {success:true,project}.
- POST /api/projects/:projectId/workspaces — body {name,configuration?}; 201 response {success:true,workspace}.
- GET /api/projects/:projectId/workspaces — response {success:true,workspaces:[...]}.
- GET /api/workspaces/:workspaceId — response {success:true,workspace}.

### Events
- POST /api/events — body {projectId,workspaceId?,sessionId?,type,source?,payload?,timestamp?}; 201 response {success:true,event}.
- POST /api/events/batch — body {events:[...]}, max 100; 201 response {success:true,events:[...]}.

### Incidents/attempts/experiences
- POST /api/incidents — body includes projectId, optional workspaceId/title/description/error fields/runtime/service/environment/version/recentChange/severity/assignedTo; 201 response {success:true,incident}.
- GET /api/incidents?projectId=...&status=...&severity=... — response {success:true,incidents:[...]}.
- GET /api/incidents/:incidentId — response {success:true,incident,attempts:[...],experience|null}.
- PATCH /api/incidents/:incidentId — body subset of incident fields; response {success:true,incident}.
- POST /api/incidents/:incidentId/attempts — body {action,result?,notes?,evidence?}; 201 response {success:true,attempt}.
- GET /api/incidents/:incidentId/attempts — response {success:true,attempts:[...]}.
- POST /api/incidents/:incidentId/resolve — body {solution,rootCause?,verification?,outcome?}; response {success:true,incident,experience,memory:{retained,status,reason}}.
- GET /api/experiences?projectId=... — response {success:true,experiences:[...]}.
- GET /api/experiences/:experienceId — response {success:true,experience}.

### Memory
- POST /api/memory/recall — body {projectId,incidentId?,problem,description?,errorMessage?,errorType?,stackTrace?,service?,language?,framework?,environment?,version?,status?,attempts?,createdAt?}; response {success:true,matchFound,matches:[...],recommendation:{...},sources:{memoryApi:boolean}}.
- No /api/memory/reflect endpoint; Member 3 handles RECALL -> Groq.

## 5. Memory API integration

Current base URL: https://mandate-scroll-tractor.ngrok-free.dev. The obsolete truncated ngrok-fo URL must not be restored. The Express adapter calls only the base URL plus /memory/retain and /memory/recall. Default timeout is 20,000 ms via MEMORY_API_TIMEOUT_MS; MEMORY_API_KEY is optional Bearer authorization. Payloads are secret-redacted.

RETAIN sends nested incident and experience objects: incident {id,service,error:{type,message,stack_trace},environment,version,description,status,attempts:[{action,result,notes}]} and experience {root_cause,resolution,lesson}. It reports stored only when the real agent returns status stored. RECALL sends full incident context including error, environment, version, description, status, attempts, and created_at. The adapter accepts the agent recommendation and maps returned similar_experiences or recommendation.similar_incident into the stable frontend shape; it never fabricates memories. Prior live verification observed RETAIN status stored and RECALL HTTP 200 with structured recommendation.similar_incident, failed/successful approaches, investigation suggestions, and caution.

## 6. Frontend contract

Use JSON and Bearer JWT. Login/register return user and token. Then call /api/auth/me, select an organization, call /api/organizations/:id and /api/projects?organizationId=.... Project/workspace screens use the project/workspace routes. Incident screens use incident, attempt, resolve, and experience routes. Memory UI calls /api/memory/recall and consumes matchFound, matches, recommendation, and sources.memoryApi. The backend owns resolve -> incident update -> Experience creation -> RETAIN -> memory status.

## 7. Environment variables

PORT (default 5000); MONGO_URI (required for persistence); JWT_SECRET (production-required; development fallback only); JWT_EXPIRES_IN (default 7d); CLIENT_URL (default http://localhost:5173); MEMORY_API_URL (current https://mandate-scroll-tractor.ngrok-free.dev); MEMORY_API_KEY (optional); MEMORY_API_TIMEOUT_MS (default 20000). A local .env was not created and secrets must not be committed.

## 8. Testing and verification status

Known prior results: npm test passed; source/module loading passed; Express startup passed; GET /api/health passed; live synthetic RETAIN returned status stored; live RECALL returned HTTP 200 with structured recommendation.similar_incident and was mapped to the stable frontend shape. Health reported MongoDB disconnected when MONGO_URI was absent. This handoff turn ran no tests, installs, or implementation checks. Not verified end-to-end: live MongoDB persistence, full auth/tenant CRUD flow, two-user isolation, frontend integration, and Member 4 incident-intelligence integration.

## 9. Git status

Git is unavailable because this workspace is not a Git repository. Prior git status returned: fatal: not a git repository (or any of the parent directories): .git. No branch, diff, or commit is available.

## 10. Remaining dependencies

Running MongoDB and MONGO_URI; Member 3 Python Memory API availability; Member 1 frontend source/integration; Member 4 incident-intelligence integration; production secrets/CORS/deployment setup; and an automated integration-test suite.

## 11. Complete current file contents

The following blocks are the exact contents read from every current backend file except this handoff document.

### backend/package.json

```json
{
  "name": "engineering-memory-backend",
  "version": "1.0.0",
  "private": true,
  "description": "Backend API for the Engineering Memory Workspace",
  "main": "src/server.js",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "check": "node --check src/server.js && node --check src/app.js",
    "test": "npm run check"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.7.2",
    "morgan": "^1.10.0",
    "zod": "^3.23.8"
  }
}
```

### backend/.env.example

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/engineering_memory
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Member 3's Python Memory Agent. Express never calls Hindsight directly.
MEMORY_API_URL=https://mandate-scroll-tractor.ngrok-free.dev
MEMORY_API_KEY=
MEMORY_API_TIMEOUT_MS=20000
```

### backend/.gitignore

```text
node_modules/
.env
npm-debug.log*
*.log
```

### backend/README.md

```markdown
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

Configure `MEMORY_API_URL=https://mandate-scroll-tractor.ngrok-free.dev` and optionally `MEMORY_API_KEY`. RETAIN sends nested `incident` and `experience` objects; RECALL sends the full incident shape required by the agent. The adapter has a configurable 20-second default timeout, validates the required response shapes, redacts secrets, and degrades safely when the agent is unavailable. There is no backend REFLECT endpoint because Member 3 handles reasoning through RECALL → Groq.
```

### backend/BACKEND_PROGRESS.md

```markdown
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
```

### backend/src/app.js

```text
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const { databaseState } = require("./config/db");
const { AppError, notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL.split(",").map((item) => item.trim()),
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/api/health", (req, res) => {
  const db = databaseState();
  res.status(db.connected || !env.MONGO_URI ? 200 : 503).json({
    success: true,
    message: "Engineering Memory API is running",
    database: db.connected ? "connected" : "disconnected",
    integrations: {
      memoryApi: Boolean(env.MEMORY_API_URL)
    }
  });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/organizations", require("./routes/organization.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api", require("./routes/workspace.routes"));
app.use("/api/events", require("./routes/event.routes"));
app.use("/api/incidents", require("./routes/incident.routes"));
app.use("/api/experiences", require("./routes/experience.routes"));
app.use("/api/memory", require("./routes/memory.routes"));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
```

### backend/src/server.js

```text
const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");

async function start() {
  try {
    await connectDatabase();
    app.listen(env.PORT, () => {
      console.log(`Engineering Memory API listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Unable to start backend:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) start();

module.exports = { start };
```

### backend/src/config/db.js

```text
const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  if (!env.MONGO_URI) {
    console.warn("MONGO_URI is not configured; protected data APIs will be unavailable.");
    return false;
  }

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  });
  console.log("MongoDB connected");
  return true;
}

function databaseState() {
  return {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState
  };
}

module.exports = { connectDatabase, databaseState };
```

### backend/src/config/env.js

```text
const dotenv = require("dotenv");

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "development-only-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  MEMORY_API_URL: process.env.MEMORY_API_URL || "",
  MEMORY_API_KEY: process.env.MEMORY_API_KEY || "",
  MEMORY_API_TIMEOUT_MS: Number(process.env.MEMORY_API_TIMEOUT_MS || 20000)
};

if (env.NODE_ENV === "production" && env.JWT_SECRET === "development-only-change-me") {
  throw new Error("JWT_SECRET must be configured in production");
}

module.exports = env;
```

### backend/src/controllers/auth.controller.js

```text
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Membership = require("../models/Membership");
const Organization = require("../models/Organization");
const generateToken = require("../utils/generateToken");
const { AppError } = require("../middleware/error.middleware");

function presentUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

async function register(req, res) {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    throw new AppError(409, "EMAIL_IN_USE", "An account with that email already exists");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, passwordHash });
  res.status(201).json({ success: true, user: presentUser(user), token: generateToken(user._id) });
}

async function login(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
  res.json({ success: true, user: presentUser(user), token: generateToken(user._id) });
}

async function me(req, res) {
  const memberships = await Membership.find({ userId: req.user._id })
    .populate("organizationId", "name description createdBy createdAt")
    .lean();
  res.json({
    success: true,
    user: presentUser(req.user),
    organizations: memberships.map((item) => ({
      ...item.organizationId,
      role: item.role,
      membershipId: item._id
    }))
  });
}

module.exports = { register, login, me };
```

### backend/src/controllers/event.controller.js

```text
const EngineeringEvent = require("../models/EngineeringEvent");
const { requireProjectMember, requireWorkspaceMember } = require("../utils/access");
const { AppError } = require("../middleware/error.middleware");
const { sanitizeObject } = require("../utils/sanitizeSecrets");

function eventPayload(data, userId, project, workspaceId) {
  return {
    organizationId: project.organizationId,
    projectId: project._id,
    workspaceId,
    userId,
    sessionId: data.sessionId,
    type: data.type,
    source: data.source,
    payload: sanitizeObject(data.payload),
    ...(data.timestamp ? { timestamp: data.timestamp } : {})
  };
}

async function create(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.body.projectId);
  if (req.body.workspaceId) {
    const { workspace } = await requireWorkspaceMember(req.user._id, req.body.workspaceId);
    if (String(workspace.projectId) !== String(project._id)) {
      throw new AppError(400, "RESOURCE_MISMATCH", "Workspace does not belong to the selected project");
    }
  }
  const event = await EngineeringEvent.create(eventPayload(req.body, req.user._id, project, req.body.workspaceId));
  res.status(201).json({ success: true, event });
}

async function createBatch(req, res) {
  const events = [];
  for (const data of req.body.events) {
    const { project } = await requireProjectMember(req.user._id, data.projectId);
    if (data.workspaceId) {
      const { workspace } = await requireWorkspaceMember(req.user._id, data.workspaceId);
      if (String(workspace.projectId) !== String(project._id)) {
        throw new AppError(400, "RESOURCE_MISMATCH", "Workspace does not belong to the selected project");
      }
    }
    events.push(eventPayload(data, req.user._id, project, data.workspaceId));
  }
  const created = await EngineeringEvent.insertMany(events);
  res.status(201).json({ success: true, events: created });
}

module.exports = { create, createBatch };
```

### backend/src/controllers/experience.controller.js

```text
const Experience = require("../models/Experience");
const { requireProjectMember } = require("../utils/access");
const { AppError } = require("../middleware/error.middleware");

async function list(req, res) {
  const query = {};
  if (req.query.projectId) {
    const { project } = await requireProjectMember(req.user._id, req.query.projectId);
    query.projectId = project._id;
  } else {
    const Membership = require("../models/Membership");
    const memberships = await Membership.find({ userId: req.user._id }).select("organizationId").lean();
    query.organizationId = { $in: memberships.map((item) => item.organizationId) };
  }
  const experiences = await Experience.find(query).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, experiences });
}

async function getOne(req, res) {
  const experience = await Experience.findById(req.params.id).lean();
  if (!experience) throw new AppError(404, "EXPERIENCE_NOT_FOUND", "Engineering experience not found");
  await requireProjectMember(req.user._id, experience.projectId);
  res.json({ success: true, experience });
}

module.exports = { list, getOne };
```

### backend/src/controllers/incident.controller.js

```text
const Incident = require("../models/Incident");
const Attempt = require("../models/Attempt");
const Experience = require("../models/Experience");
const memoryService = require("../services/memory.service");
const { requireProjectMember, requireWorkspaceMember, requireOrganizationMember } = require("../utils/access");
const { AppError } = require("../middleware/error.middleware");
const { sanitizeObject } = require("../utils/sanitizeSecrets");

async function create(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.body.projectId);
  if (req.body.workspaceId) {
    const { workspace } = await requireWorkspaceMember(req.user._id, req.body.workspaceId);
    if (String(workspace.projectId) !== String(project._id)) {
      throw new AppError(400, "RESOURCE_MISMATCH", "Workspace does not belong to the selected project");
    }
  }
  if (req.body.assignedTo) await requireOrganizationMember(req.body.assignedTo, project.organizationId);
  const incident = await Incident.create({
    ...sanitizeObject(req.body),
    organizationId: project.organizationId,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, incident });
}

async function list(req, res) {
  const query = {};
  if (req.query.projectId) {
    const { project } = await requireProjectMember(req.user._id, req.query.projectId);
    query.projectId = project._id;
  } else {
    const Membership = require("../models/Membership");
    const memberships = await Membership.find({ userId: req.user._id }).select("organizationId").lean();
    query.organizationId = { $in: memberships.map((item) => item.organizationId) };
  }
  if (req.query.status) query.status = req.query.status;
  if (req.query.severity) query.severity = req.query.severity;
  const incidents = await Incident.find(query)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, incidents });
}

async function getOne(req, res) {
  const incident = await Incident.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  if (req.body.assignedTo) await requireOrganizationMember(req.body.assignedTo, incident.organizationId);
  const [attempts, experience] = await Promise.all([
    Attempt.find({ incidentId: incident._id }).populate("performedBy", "name email").sort({ createdAt: 1 }).lean(),
    Experience.findOne({ incidentId: incident._id }).lean()
  ]);
  res.json({ success: true, incident, attempts, experience });
}

async function update(req, res) {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  Object.assign(incident, sanitizeObject(req.body));
  if (req.body.status === "resolved" && !incident.resolvedAt) incident.resolvedAt = new Date();
  await incident.save();
  res.json({ success: true, incident });
}

async function addAttempt(req, res) {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const attempt = await Attempt.create({
    ...sanitizeObject(req.body),
    organizationId: incident.organizationId,
    projectId: incident.projectId,
    incidentId: incident._id,
    performedBy: req.user._id
  });
  if (incident.status === "open") {
    incident.status = "investigating";
    await incident.save();
  }
  res.status(201).json({ success: true, attempt });
}

async function listAttempts(req, res) {
  const incident = await Incident.findById(req.params.id).select("projectId");
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const attempts = await Attempt.find({ incidentId: incident._id })
    .populate("performedBy", "name email")
    .sort({ createdAt: 1 })
    .lean();
  res.json({ success: true, attempts });
}

async function resolve(req, res) {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const attempts = await Attempt.find({ incidentId: incident._id }).sort({ createdAt: 1 }).lean();

  incident.status = "resolved";
  incident.resolution = req.body.solution;
  incident.rootCause = req.body.rootCause;
  incident.resolvedAt = new Date();
  await incident.save();

  const experience = await Experience.create({
    organizationId: incident.organizationId,
    projectId: incident.projectId,
    incidentId: incident._id,
    problem: incident.description || incident.errorMessage || incident.title,
    context: {
      title: incident.title,
      errorMessage: incident.errorMessage,
      errorType: incident.errorType,
      language: incident.language,
      framework: incident.framework,
      runtime: incident.runtime,
      service: incident.service,
      environment: incident.environment,
      version: incident.version,
      recentChange: incident.recentChange,
      filePath: incident.filePath,
      command: incident.command
    },
    attempts,
    solution: req.body.solution,
    rootCause: req.body.rootCause,
    verification: req.body.verification,
    outcome: req.body.outcome
  });

  const memory = await memoryService.retainExperience({
    incident: {
      id: experience.incidentId,
      service: incident.service,
      error: {
        type: incident.errorType,
        message: incident.errorMessage,
        stack_trace: incident.stackTrace
      },
      environment: incident.environment,
      version: incident.version,
      description: incident.description || experience.problem,
      status: incident.status,
      attempts: experience.attempts.map((attempt) => ({
        action: attempt.action,
        result: attempt.result,
        notes: attempt.notes || ""
      }))
    },
    experience: {
      root_cause: experience.rootCause,
      resolution: experience.solution,
      lesson: experience.verification
    }
  });
  experience.retentionStatus = memory.stored ? "retained" : (memory.available ? "failed" : "unavailable");
  if (memory.stored) experience.retainedAt = new Date();
  await experience.save();

  res.json({
    success: true,
    incident,
    experience,
    memory: {
      retained: memory.stored === true,
      status: memory.stored ? "stored" : "not_stored",
      reason: memory.reason || null
    }
  });
}

module.exports = { create, list, getOne, update, addAttempt, listAttempts, resolve };
```

### backend/src/controllers/memory.controller.js

```text
const memoryService = require("../services/memory.service");
const { requireProjectMember } = require("../utils/access");
const { sanitizeObject } = require("../utils/sanitizeSecrets");

function normalizeMemory(memory) {
  return {
    incidentId: memory.incident_id || null,
    title: memory.problem || "Related engineering experience",
    summary: memory.root_cause || memory.problem || "",
    problem: memory.problem || "",
    attempts: memory.attempts || [],
    solution: "",
    rootCause: memory.root_cause || "",
    verification: "",
    outcome: ""
  };
}

async function recall(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.body.projectId);
  const currentProblem = sanitizeObject({
    incident_id: req.body.incidentId || req.body.id || `project-${project._id}`,
    problem: req.body.problem,
    service: req.body.service,
    error_type: req.body.errorType || req.body.error_type || "",
    error: req.body.errorMessage || req.body.error || req.body.problem,
    stack_trace: req.body.stackTrace || req.body.stack_trace || "",
    environment: req.body.environment,
    version: req.body.version,
    description: req.body.description || req.body.problem,
    status: req.body.status || "investigating",
    attempts: req.body.attempts || [],
    created_at: req.body.createdAt
      ? req.body.createdAt.toISOString()
      : req.body.created_at
  });
  const remote = await memoryService.recallExperience(currentProblem);
  const matches = (remote.memories || []).map(normalizeMemory).slice(0, 10);
  const recommendation = remote.recommendation || {};
  const similarIncident = recommendation.similar_incident;
  const facts = Array.isArray(similarIncident?.facts) ? similarIncident.facts : [];
  const failedApproaches = Array.isArray(recommendation.failed_approaches) ? recommendation.failed_approaches : [];
  const successfulApproaches = Array.isArray(recommendation.successful_approaches) ? recommendation.successful_approaches : [];
  const investigateNow = Array.isArray(recommendation.investigate_now) ? recommendation.investigate_now : [];
  const firstMatch = matches[0];
  res.json({
    success: true,
    matchFound: matches.length > 0,
    matches: matches.map((item) => ({
      incidentId: item.incidentId,
      title: item.title,
      summary: item.summary
    })),
    recommendation: {
      summary: similarIncident
        ? `Similar incident ${similarIncident.incident_id || ""} was found.`
        : (firstMatch ? firstMatch.summary : ""),
      previousAttempts: failedApproaches.length ? failedApproaches : (firstMatch?.attempts || []),
      successfulSolution: successfulApproaches.join("\n"),
      rootCause: facts.join("\n") || firstMatch?.rootCause || "",
      reasoning: [
        ...investigateNow,
        recommendation.caution || ""
      ].filter(Boolean).join("\n")
    },
    sources: {
      memoryApi: remote.available
    }
  });
}

module.exports = { recall };
```

### backend/src/controllers/organization.controller.js

```text
const User = require("../models/User");
const Organization = require("../models/Organization");
const Membership = require("../models/Membership");
const { AppError } = require("../middleware/error.middleware");
const { requireOrganizationMember, requireOrganizationAdmin } = require("../utils/access");

async function create(req, res) {
  const organization = await Organization.create({ ...req.body, createdBy: req.user._id });
  await Membership.create({ userId: req.user._id, organizationId: organization._id, role: "admin" });
  res.status(201).json({ success: true, organization, role: "admin" });
}

async function getOne(req, res) {
  const { organization } = await requireOrganizationMember(req.user._id, req.params.id);
  const [memberCount, projectCount] = await Promise.all([
    Membership.countDocuments({ organizationId: organization._id }),
    require("../models/Project").countDocuments({ organizationId: organization._id })
  ]);
  res.json({ success: true, organization, stats: { memberCount, projectCount } });
}

async function members(req, res) {
  await requireOrganizationMember(req.user._id, req.params.id);
  const memberships = await Membership.find({ organizationId: req.params.id })
    .populate("userId", "name email createdAt")
    .lean();
  res.json({
    success: true,
    members: memberships.map((item) => ({ id: item.userId._id, name: item.userId.name, email: item.userId.email, role: item.role, joinedAt: item.createdAt }))
  });
}

async function addMember(req, res) {
  await requireOrganizationAdmin(req.user._id, req.params.id);
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "No account exists for that email");
  if (await Membership.exists({ userId: user._id, organizationId: req.params.id })) {
    throw new AppError(409, "ALREADY_MEMBER", "That user is already in this company");
  }
  const membership = await Membership.create({ userId: user._id, organizationId: req.params.id, role: req.body.role });
  res.status(201).json({ success: true, membership });
}

module.exports = { create, getOne, members, addMember };
```

### backend/src/controllers/project.controller.js

```text
const Project = require("../models/Project");
const { requireOrganizationMember, requireProjectMember } = require("../utils/access");

async function create(req, res) {
  await requireOrganizationMember(req.user._id, req.body.organizationId);
  const project = await Project.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, project });
}

async function list(req, res) {
  const query = {};
  if (req.query.organizationId) {
    await requireOrganizationMember(req.user._id, req.query.organizationId);
    query.organizationId = req.query.organizationId;
  } else {
    const Membership = require("../models/Membership");
    const memberships = await Membership.find({ userId: req.user._id }).select("organizationId").lean();
    query.organizationId = { $in: memberships.map((item) => item.organizationId) };
  }
  const projects = await Project.find(query).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, projects });
}

async function getOne(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.id);
  res.json({ success: true, project });
}

async function update(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.id);
  Object.assign(project, req.body);
  await project.save();
  res.json({ success: true, project });
}

module.exports = { create, list, getOne, update };
```

### backend/src/controllers/workspace.controller.js

```text
const Workspace = require("../models/Workspace");
const { requireProjectMember, requireWorkspaceMember } = require("../utils/access");

async function create(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.projectId);
  const workspace = await Workspace.create({
    ...req.body,
    organizationId: project.organizationId,
    projectId: project._id,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, workspace });
}

async function list(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.projectId);
  const workspaces = await Workspace.find({ projectId: project._id }).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, workspaces });
}

async function getOne(req, res) {
  const { workspace } = await requireWorkspaceMember(req.user._id, req.params.id);
  res.json({ success: true, workspace });
}

module.exports = { create, list, getOne };
```

### backend/src/middleware/auth.middleware.js

```text
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const { AppError } = require("./error.middleware");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new AppError(401, "UNAUTHENTICATED", "A bearer token is required"));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) throw new AppError(401, "UNAUTHENTICATED", "User no longer exists");
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, "UNAUTHENTICATED", "Your session is invalid or expired"));
  }
}

module.exports = { requireAuth };
```

### backend/src/middleware/error.middleware.js

```text
class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found` }
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let statusCode = error.statusCode || 500;
  let code = error.code || "INTERNAL_ERROR";
  let message = error.isOperational ? error.message : "An unexpected server error occurred";
  let details;

  if (error.name === "ZodError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
  } else if (error.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_RESOURCE";
    message = "A resource with those details already exists";
  } else if (error.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "A supplied identifier is invalid";
  }

  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details ? { details } : {}) }
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
```

### backend/src/middleware/validate.middleware.js

```text
function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
```

### backend/src/models/Attempt.js

```text
const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true, maxlength: 3000 },
    result: { type: String, enum: ["failed", "successful", "inconclusive"], default: "inconclusive" },
    notes: { type: String, trim: true, maxlength: 5000, default: "" },
    evidence: { type: String, trim: true, maxlength: 10000, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
```

### backend/src/models/EngineeringEvent.js

```text
const mongoose = require("mongoose");

const eventTypes = [
  "RUN_STARTED", "RUN_FINISHED", "BUILD_FAILED", "TEST_FAILED", "RUNTIME_ERROR",
  "TERMINAL_ERROR", "CODE_CHANGE", "FIX_ATTEMPTED", "FIX_FAILED", "FIX_VERIFIED",
  "USER_REPORTED_PROBLEM", "INCIDENT_RESOLVED"
];

const eventSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, trim: true, maxlength: 200 },
    type: { type: String, enum: eventTypes, required: true },
    source: { type: String, trim: true, maxlength: 100, default: "workspace" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

eventSchema.index({ projectId: 1, timestamp: -1 });
eventSchema.statics.eventTypes = eventTypes;
module.exports = mongoose.model("EngineeringEvent", eventSchema);
```

### backend/src/models/Experience.js

```text
const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    problem: { type: String, required: true, trim: true, maxlength: 5000 },
    context: { type: mongoose.Schema.Types.Mixed, default: {} },
    attempts: { type: [mongoose.Schema.Types.Mixed], default: [] },
    solution: { type: String, required: true, trim: true, maxlength: 5000 },
    rootCause: { type: String, trim: true, maxlength: 5000, default: "" },
    verification: { type: String, trim: true, maxlength: 5000, default: "" },
    outcome: { type: String, trim: true, maxlength: 500, default: "resolved" },
    retainedAt: Date,
    retentionStatus: { type: String, enum: ["pending", "retained", "unavailable", "failed"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);
```

### backend/src/models/Incident.js

```text
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    errorMessage: { type: String, trim: true, maxlength: 5000, default: "" },
    errorType: { type: String, trim: true, maxlength: 200, default: "" },
    stackTrace: { type: String, trim: true, maxlength: 20000, default: "" },
    filePath: { type: String, trim: true, maxlength: 500, default: "" },
    lineNumber: Number,
    columnNumber: Number,
    command: { type: String, trim: true, maxlength: 1000, default: "" },
    logs: { type: String, trim: true, maxlength: 20000, default: "" },
    language: { type: String, trim: true, maxlength: 100, default: "" },
    framework: { type: String, trim: true, maxlength: 100, default: "" },
    runtime: { type: String, trim: true, maxlength: 100, default: "" },
    service: { type: String, trim: true, maxlength: 200, default: "" },
    environment: { type: String, trim: true, maxlength: 100, default: "development" },
    version: { type: String, trim: true, maxlength: 100, default: "" },
    recentChange: { type: String, trim: true, maxlength: 1000, default: "" },
    status: { type: String, enum: ["open", "investigating", "resolved"], default: "open", index: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rootCause: { type: String, trim: true, maxlength: 5000, default: "" },
    resolution: { type: String, trim: true, maxlength: 5000, default: "" },
    resolvedAt: Date
  },
  { timestamps: true }
);

incidentSchema.index({ projectId: 1, createdAt: -1 });
module.exports = mongoose.model("Incident", incidentSchema);
```

### backend/src/models/Membership.js

```text
const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" }
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
module.exports = mongoose.model("Membership", membershipSchema);
```

### backend/src/models/Organization.js

```text
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
```

### backend/src/models/Project.js

```text
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    repositoryUrl: { type: String, trim: true, maxlength: 500, default: "" },
    techStack: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
```

### backend/src/models/User.js

```text
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

### backend/src/models/Workspace.js

```text
const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);
```

### backend/src/routes/auth.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const controller = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), asyncHandler(controller.register));
router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));
module.exports = router;
```

### backend/src/routes/event.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { eventSchema, batchEventSchema } = require("../validators/event.validator");
const controller = require("../controllers/event.controller");

router.use(requireAuth);
router.post("/", validate(eventSchema), asyncHandler(controller.create));
router.post("/batch", validate(batchEventSchema), asyncHandler(controller.createBatch));
module.exports = router;
```

### backend/src/routes/experience.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth.middleware");
const controller = require("../controllers/experience.controller");

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
module.exports = router;
```

### backend/src/routes/incident.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { createIncidentSchema, updateIncidentSchema, attemptSchema, resolveSchema } = require("../validators/incident.validator");
const controller = require("../controllers/incident.controller");

router.use(requireAuth);
router.post("/", validate(createIncidentSchema), asyncHandler(controller.create));
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
router.patch("/:id", validate(updateIncidentSchema), asyncHandler(controller.update));
router.post("/:id/attempts", validate(attemptSchema), asyncHandler(controller.addAttempt));
router.get("/:id/attempts", asyncHandler(controller.listAttempts));
router.post("/:id/resolve", validate(resolveSchema), asyncHandler(controller.resolve));
module.exports = router;
```

### backend/src/routes/memory.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { recallSchema } = require("../validators/memory.validator");
const controller = require("../controllers/memory.controller");

router.use(requireAuth);
router.post("/recall", validate(recallSchema), asyncHandler(controller.recall));
module.exports = router;
```

### backend/src/routes/organization.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { organizationSchema, addMemberSchema } = require("../validators/organization.validator");
const controller = require("../controllers/organization.controller");

router.use(requireAuth);
router.post("/", validate(organizationSchema), asyncHandler(controller.create));
router.get("/:id", asyncHandler(controller.getOne));
router.get("/:id/members", asyncHandler(controller.members));
router.post("/:id/members", validate(addMemberSchema), asyncHandler(controller.addMember));
module.exports = router;
```

### backend/src/routes/project.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validator");
const controller = require("../controllers/project.controller");

router.use(requireAuth);
router.post("/", validate(createProjectSchema), asyncHandler(controller.create));
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
router.patch("/:id", validate(updateProjectSchema), asyncHandler(controller.update));
module.exports = router;
```

### backend/src/routes/workspace.routes.js

```text
const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { createWorkspaceSchema } = require("../validators/project.validator");
const controller = require("../controllers/workspace.controller");

router.use(requireAuth);
router.post("/projects/:projectId/workspaces", validate(createWorkspaceSchema), asyncHandler(controller.create));
router.get("/projects/:projectId/workspaces", asyncHandler(controller.list));
router.get("/workspaces/:id", asyncHandler(controller.getOne));
module.exports = router;
```

### backend/src/services/memory.service.js

```text
const env = require("../config/env");
const { sanitizeObject } = require("../utils/sanitizeSecrets");

function unavailable(reason) {
  return {
    available: false,
    stored: false,
    memories: [],
    recommendation: null,
    reason
  };
}

function apiUrl(path) {
  if (!env.MEMORY_API_URL) return null;
  return new URL(path, env.MEMORY_API_URL).toString();
}

async function request(path, payload) {
  const url = apiUrl(path);
  if (!url) return unavailable("MEMORY_API_URL is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.MEMORY_API_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.MEMORY_API_KEY ? { authorization: `Bearer ${env.MEMORY_API_KEY}` } : {})
      },
      body: JSON.stringify(sanitizeObject(payload)),
      signal: controller.signal
    });

    let body;
    try {
      body = await response.json();
    } catch {
      return unavailable("Memory API returned invalid JSON");
    }

    if (!response.ok) {
      return unavailable(`Memory API returned HTTP ${response.status}`);
    }
    return { available: true, body };
  } catch (error) {
    return unavailable(error.name === "AbortError" ? "Memory API request timed out" : "Memory API is unavailable");
  } finally {
    clearTimeout(timeout);
  }
}

async function retainExperience(data) {
  const result = await request("/memory/retain", {
    incident: {
      id: String(data.incident.id),
      service: data.incident.service || "",
      error: {
        type: data.incident.error?.type || "",
        message: data.incident.error?.message || "",
        stack_trace: data.incident.error?.stack_trace || ""
      },
      environment: data.incident.environment || "",
      version: data.incident.version || "",
      description: data.incident.description || "",
      status: data.incident.status || "resolved",
      attempts: data.incident.attempts || []
    },
    experience: {
      root_cause: data.experience.root_cause || "",
      resolution: data.experience.resolution || "",
      lesson: data.experience.lesson || ""
    }
  });

  if (!result.available) return result;
  if (result.body?.status !== "stored") {
    return unavailable("Memory API did not confirm storage");
  }
  return {
    available: true,
    stored: true,
    status: "stored",
    incidentId: result.body.incident_id || String(data.incident.id),
    memories: [],
    recommendation: null
  };
}

async function recallExperience(data) {
  const payload = {
    id: String(data.incident_id),
    service: data.service || "",
    error: {
      type: data.error_type || "",
      message: data.error || data.problem || "",
      stack_trace: data.stack_trace || ""
    },
    environment: data.environment || "",
    version: data.version || "",
    description: data.description || data.problem || "",
    status: data.status || "investigating",
    attempts: data.attempts || [],
    created_at: data.created_at || new Date().toISOString()
  };
  const result = await request("/memory/recall", payload);
  if (!result.available) return result;

  const recommendation = result.body?.recommendation;
  if (!recommendation || typeof recommendation !== "object") {
    return unavailable("Memory API returned an invalid recall shape");
  }
  const memories = Array.isArray(result.body?.similar_experiences)
    ? result.body.similar_experiences
    : recommendation.similar_incident?.incident_id
      ? [{
          incident_id: recommendation.similar_incident.incident_id,
          problem: "Similar incident returned by Memory API",
          root_cause: Array.isArray(recommendation.similar_incident.facts)
            ? recommendation.similar_incident.facts.join("; ")
            : "",
          attempts: [
            ...(Array.isArray(recommendation.failed_approaches) ? recommendation.failed_approaches : [])
              .map((action) => ({ action, result: "failed" })),
            ...(Array.isArray(recommendation.successful_approaches) ? recommendation.successful_approaches : [])
              .map((action) => ({ action, result: "successful" }))
          ]
        }]
      : [];

  return {
    available: true,
    memories,
    recommendation,
    incidentId: result.body.incident_id || payload.id
  };
}

module.exports = { retainExperience, recallExperience };
```

### backend/src/utils/access.js

```text
const mongoose = require("mongoose");
const Membership = require("../models/Membership");
const Organization = require("../models/Organization");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const { AppError } = require("../middleware/error.middleware");

function asObjectId(value, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, "INVALID_ID", `${label} is invalid`);
  }
  return new mongoose.Types.ObjectId(value);
}

async function findMembership(userId, organizationId) {
  return Membership.findOne({ userId, organizationId }).lean();
}

async function requireOrganizationMember(userId, organizationId) {
  const organization = await Organization.findById(organizationId);
  if (!organization) throw new AppError(404, "ORGANIZATION_NOT_FOUND", "Company not found");
  const membership = await findMembership(userId, organizationId);
  if (!membership) throw new AppError(403, "FORBIDDEN", "You do not have access to this company");
  return { organization, membership };
}

async function requireOrganizationAdmin(userId, organizationId) {
  const result = await requireOrganizationMember(userId, organizationId);
  if (result.membership.role !== "admin") {
    throw new AppError(403, "ADMIN_REQUIRED", "Admin access is required");
  }
  return result;
}

async function requireProjectMember(userId, projectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  const access = await requireOrganizationMember(userId, project.organizationId);
  return { project, ...access };
}

async function requireWorkspaceMember(userId, workspaceId) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new AppError(404, "WORKSPACE_NOT_FOUND", "Workspace not found");
  const access = await requireProjectMember(userId, workspace.projectId);
  return { workspace, ...access };
}

module.exports = {
  asObjectId,
  findMembership,
  requireOrganizationMember,
  requireOrganizationAdmin,
  requireProjectMember,
  requireWorkspaceMember
};
```

### backend/src/utils/asyncHandler.js

```text
module.exports = function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
```

### backend/src/utils/generateToken.js

```text
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateToken(userId) {
  return jwt.sign({ userId: String(userId) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

module.exports = generateToken;
```

### backend/src/utils/sanitizeSecrets.js

```text
const secretPatterns = [
  /-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/gi,
  /\b(?:sk|pk|ghp|xoxb|xoxp|AIza|AKIA)[A-Za-z0-9_\-/]{12,}\b/g,
  /\b(?:api[_-]?key|token|secret|password|passwd|authorization|database[_-]?url)\s*[:=]\s*["']?[^"',\s}\n]+/gi,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+\b/gi,
  /(?:^|\n)\s*[\w.-]+=(?:["'][^"']+["']|[^\s]+)/g
];

function sanitizeSecrets(value) {
  if (typeof value !== "string") {
    return value;
  }
  return secretPatterns.reduce((result, pattern) => result.replace(pattern, "[REDACTED]"), value);
}

function sanitizeObject(value) {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeObject(item)])
    );
  }
  return sanitizeSecrets(value);
}

module.exports = { sanitizeSecrets, sanitizeObject };
```

### backend/src/validators/auth.validator.js

```text
const { z } = require("zod");

const password = z.string().min(8).max(128);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128)
});

module.exports = { registerSchema, loginSchema };
```

### backend/src/validators/event.validator.js

```text
const { z } = require("zod");
const { objectId } = require("./project.validator");

const eventSchema = z.object({
  projectId: objectId,
  workspaceId: objectId.optional(),
  sessionId: z.string().trim().max(200).optional(),
  type: z.enum([
    "RUN_STARTED", "RUN_FINISHED", "BUILD_FAILED", "TEST_FAILED", "RUNTIME_ERROR",
    "TERMINAL_ERROR", "CODE_CHANGE", "FIX_ATTEMPTED", "FIX_FAILED", "FIX_VERIFIED",
    "USER_REPORTED_PROBLEM", "INCIDENT_RESOLVED"
  ]),
  source: z.string().trim().max(100).optional().default("workspace"),
  payload: z.record(z.any()).optional().default({}),
  timestamp: z.coerce.date().optional()
});

const batchEventSchema = z.object({ events: z.array(eventSchema).min(1).max(100) });
module.exports = { eventSchema, batchEventSchema };
```

### backend/src/validators/incident.validator.js

```text
const { z } = require("zod");
const { objectId } = require("./project.validator");

const incidentFields = {
  projectId: objectId,
  workspaceId: objectId.optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  errorMessage: z.string().trim().max(5000).optional().default(""),
  errorType: z.string().trim().max(200).optional().default(""),
  stackTrace: z.string().trim().max(20000).optional().default(""),
  filePath: z.string().trim().max(500).optional().default(""),
  lineNumber: z.number().int().nonnegative().optional(),
  columnNumber: z.number().int().nonnegative().optional(),
  command: z.string().trim().max(1000).optional().default(""),
  logs: z.string().trim().max(20000).optional().default(""),
  language: z.string().trim().max(100).optional().default(""),
  framework: z.string().trim().max(100).optional().default(""),
  runtime: z.string().trim().max(100).optional().default(""),
  service: z.string().trim().max(200).optional().default(""),
  environment: z.string().trim().max(100).optional().default("development"),
  version: z.string().trim().max(100).optional().default(""),
  recentChange: z.string().trim().max(1000).optional().default(""),
  severity: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  assignedTo: objectId.optional()
};

const createIncidentSchema = z.object(incidentFields);
const updateIncidentSchema = z.object({
  title: incidentFields.title.optional(),
  description: incidentFields.description.optional(),
  status: z.enum(["open", "investigating", "resolved"]).optional(),
  severity: incidentFields.severity,
  assignedTo: incidentFields.assignedTo,
  rootCause: z.string().trim().max(5000).optional(),
  resolution: z.string().trim().max(5000).optional()
}).partial();

const attemptSchema = z.object({
  action: z.string().trim().min(2).max(3000),
  result: z.enum(["failed", "successful", "inconclusive"]).optional().default("inconclusive"),
  notes: z.string().trim().max(5000).optional().default(""),
  evidence: z.string().trim().max(10000).optional().default("")
});

const resolveSchema = z.object({
  solution: z.string().trim().min(2).max(5000),
  rootCause: z.string().trim().max(5000).optional().default(""),
  verification: z.string().trim().max(5000).optional().default(""),
  outcome: z.string().trim().max(500).optional().default("resolved")
});

module.exports = { createIncidentSchema, updateIncidentSchema, attemptSchema, resolveSchema };
```

### backend/src/validators/memory.validator.js

```text
const { z } = require("zod");
const { objectId } = require("./project.validator");

const recallSchema = z.object({
  projectId: objectId,
  incidentId: objectId.optional(),
  problem: z.string().trim().min(3).max(5000),
  description: z.string().trim().max(5000).optional(),
  errorMessage: z.string().trim().max(5000).optional().default(""),
  errorType: z.string().trim().max(200).optional().default(""),
  stackTrace: z.string().trim().max(20000).optional().default(""),
  service: z.string().trim().max(200).optional().default(""),
  language: z.string().trim().max(100).optional().default(""),
  framework: z.string().trim().max(100).optional().default(""),
  environment: z.string().trim().max(100).optional().default("development"),
  version: z.string().trim().max(100).optional().default(""),
  status: z.enum(["open", "investigating", "resolved"]).optional().default("investigating"),
  attempts: z.array(z.object({
    action: z.string().trim().max(3000),
    result: z.string().trim().max(100),
    notes: z.string().trim().max(5000).optional().default("")
  })).max(20).optional().default([]),
  createdAt: z.coerce.date().optional()
});
module.exports = { recallSchema };
```

### backend/src/validators/organization.validator.js

```text
const { z } = require("zod");

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().default("")
});

const addMemberSchema = z.object({
  email: z.string().trim().email().max(255),
  role: z.enum(["admin", "member"]).default("member")
});

module.exports = { organizationSchema, addMemberSchema };
```

### backend/src/validators/project.validator.js

```text
const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "must be a valid identifier");

const createProjectSchema = z.object({
  organizationId: objectId,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  repositoryUrl: z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  techStack: z.array(z.string().trim().min(1).max(100)).max(30).optional().default([])
});

const updateProjectSchema = createProjectSchema.omit({ organizationId: true }).partial();
const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  configuration: z.record(z.any()).optional().default({})
});

module.exports = { objectId, createProjectSchema, updateProjectSchema, createWorkspaceSchema };
```
