const mongoose = require("mongoose");
const Membership = require("../models/Membership");
const Organization = require("../models/Organization");
const Project = require("../models/Project");
const Workspace = require("../models/Workspace");
const { AppError } = require("../middleware/error.middleware");

function asObjectId(value, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, "INVALID_ID", `${label} is invalid`);
  }
  return new mongoose.Types.ObjectId(value);
}

async function findMembership(userId, organizationId) {
  return Membership.findOne({ userId, organizationId }).lean();
}

async function requireOrganizationMember(userId, organizationId) {
  const organization = await Organization.findById(organizationId);
  if (!organization) throw new AppError(404, "ORGANIZATION_NOT_FOUND", "Company not found");
  const membership = await findMembership(userId, organizationId);
  if (!membership) throw new AppError(403, "FORBIDDEN", "You do not have access to this company");
  return { organization, membership };
}

async function requireOrganizationAdmin(userId, organizationId) {
  const result = await requireOrganizationMember(userId, organizationId);
  if (result.membership.role !== "admin") {
    throw new AppError(403, "ADMIN_REQUIRED", "Admin access is required");
  }
  return result;
}

async function requireProjectMember(userId, projectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  const access = await requireOrganizationMember(userId, project.organizationId);
  return { project, ...access };
}

async function requireWorkspaceMember(userId, workspaceId) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new AppError(404, "WORKSPACE_NOT_FOUND", "Workspace not found");
  const access = await requireProjectMember(userId, workspace.projectId);
  return { workspace, ...access };
}

module.exports = {
  asObjectId,
  findMembership,
  requireOrganizationMember,
  requireOrganizationAdmin,
  requireProjectMember,
  requireWorkspaceMember
};