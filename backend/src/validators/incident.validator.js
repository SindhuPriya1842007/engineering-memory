const { z } = require("zod");
const { objectId } = require("./project.validator");

const incidentFields = {
  projectId: objectId,
  workspaceId: objectId.optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  errorMessage: z.string().trim().max(5000).optional().default(""),
  errorType: z.string().trim().max(200).optional().default(""),
  stackTrace: z.string().trim().max(20000).optional().default(""),
  filePath: z.string().trim().max(500).optional().default(""),
  lineNumber: z.number().int().nonnegative().optional(),
  columnNumber: z.number().int().nonnegative().optional(),
  command: z.string().trim().max(1000).optional().default(""),
  logs: z.string().trim().max(20000).optional().default(""),
  language: z.string().trim().max(100).optional().default(""),
  framework: z.string().trim().max(100).optional().default(""),
  runtime: z.string().trim().max(100).optional().default(""),
  service: z.string().trim().max(200).optional().default(""),
  environment: z.string().trim().max(100).optional().default("development"),
  version: z.string().trim().max(100).optional().default(""),
  recentChange: z.string().trim().max(1000).optional().default(""),
  severity: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  assignedTo: objectId.optional()
};

const createIncidentSchema = z.object(incidentFields);
const updateIncidentSchema = z.object({
  title: incidentFields.title.optional(),
  description: incidentFields.description.optional(),
  status: z.enum(["open", "investigating", "resolved"]).optional(),
  severity: incidentFields.severity,
  assignedTo: incidentFields.assignedTo,
  rootCause: z.string().trim().max(5000).optional(),
  resolution: z.string().trim().max(5000).optional()
}).partial();

const attemptSchema = z.object({
  action: z.string().trim().min(2).max(3000),
  result: z.enum(["failed", "successful", "inconclusive"]).optional().default("inconclusive"),
  notes: z.string().trim().max(5000).optional().default(""),
  evidence: z.string().trim().max(10000).optional().default("")
});

const resolveSchema = z.object({
  solution: z.string().trim().min(2).max(5000),
  rootCause: z.string().trim().max(5000).optional().default(""),
  verification: z.string().trim().max(5000).optional().default(""),
  outcome: z.string().trim().max(500).optional().default("resolved")
});

module.exports = { createIncidentSchema, updateIncidentSchema, attemptSchema, resolveSchema };