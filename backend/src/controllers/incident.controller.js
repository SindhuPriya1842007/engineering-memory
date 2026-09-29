const Incident = require("../models/Incident");
const Attempt = require("../models/Attempt");
const Experience = require("../models/Experience");
const memoryService = require("../services/memory.service");
const { requireProjectMember, requireWorkspaceMember, requireOrganizationMember } = require("../utils/access");
const { AppError } = require("../middleware/error.middleware");
const { sanitizeObject } = require("../utils/sanitizeSecrets");

async function create(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.body.projectId);
  if (req.body.workspaceId) {
    const { workspace } = await requireWorkspaceMember(req.user._id, req.body.workspaceId);
    if (String(workspace.projectId) !== String(project._id)) {
      throw new AppError(400, "RESOURCE_MISMATCH", "Workspace does not belong to the selected project");
    }
  }
  if (req.body.assignedTo) await requireOrganizationMember(req.body.assignedTo, project.organizationId);
  const incident = await Incident.create({
    ...sanitizeObject(req.body),
    organizationId: project.organizationId,
    createdBy: req.user._id
  });
  res.status(201).json({ success: true, incident });
}

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
  if (req.query.status) query.status = req.query.status;
  if (req.query.severity) query.severity = req.query.severity;
  const incidents = await Incident.find(query)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, incidents });
}

async function getOne(req, res) {
  const incident = await Incident.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const [attempts, experience] = await Promise.all([
    Attempt.find({ incidentId: incident._id }).populate("performedBy", "name email").sort({ createdAt: 1 }).lean(),
    Experience.findOne({ incidentId: incident._id }).lean()
  ]);
  res.json({ success: true, incident, attempts, experience });
}

async function update(req, res) {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  Object.assign(incident, sanitizeObject(req.body));
  if (req.body.status === "resolved" && !incident.resolvedAt) incident.resolvedAt = new Date();
  await incident.save();
  res.json({ success: true, incident });
}

async function addAttempt(req, res) {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const attempt = await Attempt.create({
    ...sanitizeObject(req.body),
    organizationId: incident.organizationId,
    projectId: incident.projectId,
    incidentId: incident._id,
    performedBy: req.user._id
  });
  if (incident.status === "open") {
    incident.status = "investigating";
    await incident.save();
  }
  res.status(201).json({ success: true, attempt });
}

async function listAttempts(req, res) {
  const incident = await Incident.findById(req.params.id).select("projectId");
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const attempts = await Attempt.find({ incidentId: incident._id })
    .populate("performedBy", "name email")
    .sort({ createdAt: 1 })
    .lean();
  res.json({ success: true, attempts });
}

async function resolve(req, res) {
  const incident = await Incident.findById(req.params.id);
  if (!incident) throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident not found");
  await requireProjectMember(req.user._id, incident.projectId);
  const attempts = await Attempt.find({ incidentId: incident._id }).sort({ createdAt: 1 }).lean();

  incident.status = "resolved";
  incident.resolution = req.body.solution;
  incident.rootCause = req.body.rootCause;
  incident.resolvedAt = new Date();
  await incident.save();

  const experience = await Experience.create({
    organizationId: incident.organizationId,
    projectId: incident.projectId,
    incidentId: incident._id,
    problem: incident.description || incident.errorMessage || incident.title,
    context: {
      title: incident.title,
      errorMessage: incident.errorMessage,
      errorType: incident.errorType,
      language: incident.language,
      framework: incident.framework,
      runtime: incident.runtime,
      service: incident.service,
      environment: incident.environment,
      version: incident.version,
      recentChange: incident.recentChange,
      filePath: incident.filePath,
      command: incident.command
    },
    attempts,
    solution: req.body.solution,
    rootCause: req.body.rootCause,
    verification: req.body.verification,
    lesson: req.body.lesson,
    outcome: req.body.outcome
  });

  const memory = await memoryService.retainExperience({
    organizationId: incident.organizationId,
    incident: {
      id: experience.incidentId,
      service: incident.service,
      error: {
        type: incident.errorType,
        message: incident.errorMessage,
        stack_trace: incident.stackTrace
      },
      environment: incident.environment,
      version: incident.version,
      description: incident.description || experience.problem,
      status: incident.status,
      attempts: experience.attempts.map((attempt) => ({
        action: attempt.action,
        result: attempt.result,
        notes: attempt.notes || ""
      }))
    },
    experience: {
      root_cause: experience.rootCause,
      resolution: experience.solution,
      lesson: experience.lesson
    }
  });
  experience.retentionStatus = memory.stored ? "retained" : (memory.available ? "failed" : "unavailable");
  if (memory.stored) experience.retainedAt = new Date();
  await experience.save();

  res.json({
    success: true,
    incident,
    experience,
    memory: {
      retained: memory.stored === true,
      status: memory.stored ? "stored" : "not_stored",
      reason: memory.reason || null
    }
  });
}

module.exports = { create, list, getOne, update, addAttempt, listAttempts, resolve };