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