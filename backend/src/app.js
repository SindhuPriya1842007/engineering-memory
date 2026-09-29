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
      memoryApi: Boolean(env.MEMORY_API_URL),
      incidentEngine: Boolean(env.INCIDENT_ENGINE_URL)
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