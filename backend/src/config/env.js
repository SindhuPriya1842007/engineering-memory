const dotenv = require("dotenv");

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "development-only-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  MEMORY_API_URL: process.env.MEMORY_API_URL || "",
  MEMORY_API_KEY: process.env.MEMORY_API_KEY || "",
  MEMORY_API_TIMEOUT_MS: Number(process.env.MEMORY_API_TIMEOUT_MS || 20000),
  INCIDENT_ENGINE_URL: process.env.INCIDENT_ENGINE_URL || "",
  INCIDENT_ENGINE_TIMEOUT_MS: Number(process.env.INCIDENT_ENGINE_TIMEOUT_MS || 10000)
};

if (env.NODE_ENV === "production" && env.JWT_SECRET === "development-only-change-me") {
  throw new Error("JWT_SECRET must be configured in production");
}

module.exports = env;