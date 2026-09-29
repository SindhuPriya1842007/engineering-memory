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