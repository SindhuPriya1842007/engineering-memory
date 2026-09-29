const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "must be a valid identifier");

const createProjectSchema = z.object({
  organizationId: objectId,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  repositoryUrl: z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  techStack: z.array(z.string().trim().min(1).max(100)).max(30).optional().default([])
});

const updateProjectSchema = createProjectSchema.omit({ organizationId: true }).partial();
const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  configuration: z.record(z.any()).optional().default({})
});

module.exports = { objectId, createProjectSchema, updateProjectSchema, createWorkspaceSchema };