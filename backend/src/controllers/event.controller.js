const EngineeringEvent = require("../models/EngineeringEvent");
const { requireProjectMember, requireWorkspaceMember } = require("../utils/access");
const { AppError } = require("../middleware/error.middleware");
const { sanitizeObject } = require("../utils/sanitizeSecrets");

function eventPayload(data, userId, project, workspaceId) {
  return {
    organizationId: project.organizationId,
    projectId: project._id,
    workspaceId,
    userId,
    sessionId: data.sessionId,
    type: data.type,
    source: data.source,
    payload: sanitizeObject(data.payload),
    ...(data.timestamp ? { timestamp: data.timestamp } : {})
  };
}

async function create(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.body.projectId);
  if (req.body.workspaceId) {
    const { workspace } = await requireWorkspaceMember(req.user._id, req.body.workspaceId);
    if (String(workspace.projectId) !== String(project._id)) {
      throw new AppError(400, "RESOURCE_MISMATCH", "Workspace does not belong to the selected project");
    }
  }
  const event = await EngineeringEvent.create(eventPayload(req.body, req.user._id, project, req.body.workspaceId));
  res.status(201).json({ success: true, event });
}

async function createBatch(req, res) {
  const events = [];
  for (const data of req.body.events) {
    const { project } = await requireProjectMember(req.user._id, data.projectId);
    if (data.workspaceId) {
      const { workspace } = await requireWorkspaceMember(req.user._id, data.workspaceId);
      if (String(workspace.projectId) !== String(project._id)) {
        throw new AppError(400, "RESOURCE_MISMATCH", "Workspace does not belong to the selected project");
      }
    }
    events.push(eventPayload(data, req.user._id, project, data.workspaceId));
  }
  const created = await EngineeringEvent.insertMany(events);
  res.status(201).json({ success: true, events: created });
}

module.exports = { create, createBatch };