const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateToken(userId) {
  return jwt.sign({ userId: String(userId) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

module.exports = generateToken;