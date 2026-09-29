const { z } = require("zod");
const { objectId } = require("./project.validator");

const recallSchema = z.object({
  projectId: objectId,
  incidentId: objectId.optional(),
  problem: z.string().trim().min(3).max(5000),
  description: z.string().trim().max(5000).optional(),
  errorMessage: z.string().trim().max(5000).optional().default(""),
  errorType: z.string().trim().max(200).optional().default(""),
  stackTrace: z.string().trim().max(20000).optional().default(""),
  service: z.string().trim().max(200).optional().default(""),
  language: z.string().trim().max(100).optional().default(""),
  framework: z.string().trim().max(100).optional().default(""),
  environment: z.string().trim().max(100).optional().default("development"),
  version: z.string().trim().max(100).optional().default(""),
  status: z.enum(["open", "investigating", "resolved"]).optional().default("investigating"),
  attempts: z.array(z.object({
    action: z.string().trim().max(3000),
    result: z.string().trim().max(100),
    notes: z.string().trim().max(5000).optional().default("")
  })).max(20).optional().default([]),
  createdAt: z.coerce.date().optional()
});
const reflectSchema = z.object({ projectId: objectId, query: z.string().trim().min(3).max(5000) });
module.exports = { recallSchema, reflectSchema };