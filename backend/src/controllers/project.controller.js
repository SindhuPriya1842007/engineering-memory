const Project = require("../models/Project");
const { requireOrganizationMember, requireProjectMember } = require("../utils/access");

async function create(req, res) {
  await requireOrganizationMember(req.user._id, req.body.organizationId);
  const project = await Project.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, project });
}

async function list(req, res) {
  const query = {};
  if (req.query.organizationId) {
    await requireOrganizationMember(req.user._id, req.query.organizationId);
    query.organizationId = req.query.organizationId;
  } else {
    const Membership = require("../models/Membership");
    const memberships = await Membership.find({ userId: req.user._id }).select("organizationId").lean();
    query.organizationId = { $in: memberships.map((item) => item.organizationId) };
  }
  const projects = await Project.find(query).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, projects });
}

async function getOne(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.id);
  res.json({ success: true, project });
}

async function update(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.id);
  Object.assign(project, req.body);
  await project.save();
  res.json({ success: true, project });
}

module.exports = { create, list, getOne, update };