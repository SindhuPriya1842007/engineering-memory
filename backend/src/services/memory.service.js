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

function bankIdFrom(data) {
  const bankId = data?.bank_id || data?.organizationId || data?.organization_id;
  return bankId ? String(bankId) : null;
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
  const bankId = bankIdFrom(data);
  if (!bankId) return unavailable("Organization context is required for memory retention");

  const result = await request("/memory/retain", {
    bank_id: bankId,
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
  const bankId = bankIdFrom(data);
  if (!bankId) return unavailable("Organization context is required for memory recall");

  const payload = {
    bank_id: bankId,
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

async function reflectExperience(data) {
  const bankId = bankIdFrom(data);
  if (!bankId) return unavailable("Organization context is required for memory reflection");
  const result = await request("/memory/reflect", {
    bank_id: bankId,
    query: data.query || ""
  });
  if (!result.available) return result;
  return {
    available: true,
    answer: result.body?.answer || "",
    sources: Array.isArray(result.body?.sources) ? result.body.sources : []
  };
}

module.exports = { retainExperience, recallExperience, reflectExperience };