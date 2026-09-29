const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { createWorkspaceSchema } = require("../validators/project.validator");
const controller = require("../controllers/workspace.controller");

router.use(requireAuth);
router.post("/projects/:projectId/workspaces", validate(createWorkspaceSchema), asyncHandler(controller.create));
router.get("/projects/:projectId/workspaces", asyncHandler(controller.list));
router.get("/workspaces/:id", asyncHandler(controller.getOne));
module.exports = router;