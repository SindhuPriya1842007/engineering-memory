const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { createIncidentSchema, updateIncidentSchema, attemptSchema, resolveSchema } = require("../validators/incident.validator");
const controller = require("../controllers/incident.controller");

router.use(requireAuth);
router.post("/", validate(createIncidentSchema), asyncHandler(controller.create));
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
router.patch("/:id", validate(updateIncidentSchema), asyncHandler(controller.update));
router.post("/:id/attempts", validate(attemptSchema), asyncHandler(controller.addAttempt));
router.get("/:id/attempts", asyncHandler(controller.listAttempts));
router.post("/:id/resolve", validate(resolveSchema), asyncHandler(controller.resolve));
module.exports = router;