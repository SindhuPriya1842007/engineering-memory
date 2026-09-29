const { z } = require("zod");

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().default("")
});

const addMemberSchema = z.object({
  email: z.string().trim().email().max(255),
  role: z.enum(["admin", "member"]).default("member")
});

module.exports = { organizationSchema, addMemberSchema };