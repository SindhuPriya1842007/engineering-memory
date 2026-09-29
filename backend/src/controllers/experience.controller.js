const Experience = require("../models/Experience");
const { requireProjectMember } = require("../utils/access");
const { AppError } = require("../middleware/error.middleware");

async function list(req, res) {
  const query = {};
  if (req.query.projectId) {
    const { project } = await requireProjectMember(req.user._id, req.query.projectId);
    query.projectId = project._id;
  } else {
    const Membership = require("../models/Membership");
    const memberships = await Membership.find({ userId: req.user._id }).select("organizationId").lean();
    query.organizationId = { $in: memberships.map((item) => item.organizationId) };
  }
  const experiences = await Experience.find(query).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, experiences });
}

async function getOne(req, res) {
  const experience = await Experience.findById(req.params.id).lean();
  if (!experience) throw new AppError(404, "EXPERIENCE_NOT_FOUND", "Engineering experience not found");
  await requireProjectMember(req.user._id, experience.projectId);
  res.json({ success: true, experience });
}

module.exports = { list, getOne };