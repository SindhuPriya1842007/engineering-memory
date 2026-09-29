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