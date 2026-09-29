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