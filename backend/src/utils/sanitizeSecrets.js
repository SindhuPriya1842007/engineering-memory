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