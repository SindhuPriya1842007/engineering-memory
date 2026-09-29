const env = require('../config/env');

function unavailable(reason) {
  return { available: false, reason };
}

function apiUrl() {
  if (!env.INCIDENT_ENGINE_URL) return null;
  return new URL('/api/memory/recall', env.INCIDENT_ENGINE_URL).toString();
}

async function recall(data) {
  const url = apiUrl();
  if (!url) return unavailable('INCIDENT_ENGINE_URL is not configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.INCIDENT_ENGINE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return unavailable(`Incident Engine returned HTTP ${response.status}`);
    return { available: true, body };
  } catch (error) {
    return unavailable(error.name === 'AbortError' ? 'Incident Engine request timed out' : 'Incident Engine is unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { recall };
