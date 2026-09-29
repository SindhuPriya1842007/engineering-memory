const { z } = require("zod");
const { objectId } = require("./project.validator");

const eventSchema = z.object({
  projectId: objectId,
  workspaceId: objectId.optional(),
  sessionId: z.string().trim().max(200).optional(),
  type: z.enum([
    "RUN_STARTED", "RUN_FINISHED", "BUILD_FAILED", "TEST_FAILED", "RUNTIME_ERROR",
    "TERMINAL_ERROR", "CODE_CHANGE", "FIX_ATTEMPTED", "FIX_FAILED", "FIX_VERIFIED",
    "USER_REPORTED_PROBLEM", "INCIDENT_RESOLVED"
  ]),
  source: z.string().trim().max(100).optional().default("workspace"),
  payload: z.record(z.any()).optional().default({}),
  timestamp: z.coerce.date().optional()
});

const batchEventSchema = z.object({ events: z.array(eventSchema).min(1).max(100) });
module.exports = { eventSchema, batchEventSchema };