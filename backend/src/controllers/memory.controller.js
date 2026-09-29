const memoryService = require("../services/memory.service");
const { requireProjectMember } = require("../utils/access");
const { sanitizeObject } = require("../utils/sanitizeSecrets");
const Experience = require("../models/Experience");
const incidentEngine = require("../services/incident-engine.service");

function normalizeMemory(memory) {
  return {
    incidentId: memory.incident_id || null,
    title: memory.problem || "Related engineering experience",
    summary: memory.root_cause || memory.problem || "",
    problem: memory.problem || "",
    attempts: memory.attempts || [],
    solution: "",
    rootCause: memory.root_cause || "",
    verification: "",
    outcome: ""
  };
}

async function recall(req, res) {
  const { project } = await requireProjectMember(req.user._id, req.body.projectId);
  const currentProblem = sanitizeObject({
    incident_id: req.body.incidentId || req.body.id || `project-${project._id}`,
    problem: req.body.problem,
    service: req.body.service,
    error_type: req.body.errorType || req.body.error_type || "",
    error: req.body.errorMessage || req.body.error || req.body.problem,
    stack_trace: req.body.stackTrace || req.body.stack_trace || "",
    environment: req.body.environment,
    version: req.body.version,
    description: req.body.description || req.body.problem,
    status: req.body.status || "investigating",
    attempts: req.body.attempts || [],
    created_at: req.body.createdAt
      ? req.body.createdAt.toISOString()
      : req.body.created_at
  });
  const remote = await memoryService.recallExperience({
    ...currentProblem,
    organizationId: project.organizationId
  });

  const experiences = await Experience.find({ organizationId: project.organizationId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const retrievedExperiences = experiences.map((experience) => ({
    incident_id: String(experience.incidentId),
    problem: {
      service: experience.context?.service || "",
      error: experience.context?.errorType || experience.context?.errorMessage || "",
      environment: experience.context?.environment || "",
      version: experience.context?.version || ""
    },
    failed_attempts: (experience.attempts || []).filter((a) => a.result === "failed").map((a) => ({ action: a.action })),
    successful_attempts: (experience.attempts || []).filter((a) => a.result === "successful").map((a) => ({ action: a.action })),
    lessons: [experience.verification, experience.solution, experience.outcome].filter(Boolean),
    root_cause: experience.rootCause || ""
  }));
  const engine = await incidentEngine.recall({
    service: currentProblem.service,
    error: currentProblem.error_type || currentProblem.error,
    environment: currentProblem.environment,
    version: currentProblem.version,
    description: currentProblem.description,
    retrieved_experiences: retrievedExperiences
  });
  const matches = (remote.memories || []).map(normalizeMemory).slice(0, 10);
  const recommendation = remote.recommendation || {};
  const similarIncident = recommendation.similar_incident;
  const facts = Array.isArray(similarIncident?.facts) ? similarIncident.facts : [];
  const failedApproaches = Array.isArray(recommendation.failed_approaches) ? recommendation.failed_approaches : [];
  const successfulApproaches = Array.isArray(recommendation.successful_approaches) ? recommendation.successful_approaches : [];
  const investigateNow = Array.isArray(recommendation.investigate_now) ? recommendation.investigate_now : [];
  const firstMatch = matches[0];
  res.json({
    success: true,
    matchFound: matches.length > 0,
    matches: matches.map((item) => ({
      incidentId: item.incidentId,
      title: item.title,
      summary: item.summary
    })),
    recommendation: {
      summary: engine.available
        ? (engine.body.recommended_next_step || engine.body.lesson || "Incident Engine processed the retrieved experiences.")
        : (similarIncident
          ? `Similar incident ${similarIncident.incident_id || ""} was found.`
          : (firstMatch ? firstMatch.summary : "")),
      previousAttempts: failedApproaches.length ? failedApproaches : (firstMatch?.attempts || []),
      successfulSolution: successfulApproaches.join("\n"),
      rootCause: facts.join("\n") || firstMatch?.rootCause || "",
      reasoning: [
        ...investigateNow,
        recommendation.caution || ""
      ].filter(Boolean).join("\n")
    },
    sources: {
      memoryApi: remote.available,
      incidentEngine: engine.available
    },
    incidentEngine: engine.available ? engine.body : null
  });
}

module.exports = { recall };