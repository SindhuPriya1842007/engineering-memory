const Workspace = require("../models/Workspace");
const { requireProjectMember, requireWorkspaceMember } = require("../utils/access");

async function create(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.projectId);
  const workspace = await Workspace.create({
    ...req.body,
    organizationId: project.organizationId,
    projectId: project._id,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, workspace });
}

async function list(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.params.projectId);
  const workspaces = await Workspace.find({ projectId: project._id }).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, workspaces });
}

async function getOne(req, res) {
  const { workspace } = await requireWorkspaceMember(req.user._id, req.params.id);
  res.json({ success: true, workspace });
}

module.exports = { create, list, getOne };