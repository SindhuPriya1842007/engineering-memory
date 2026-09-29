const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validator");
const controller = require("../controllers/project.controller");

router.use(requireAuth);
router.post("/", validate(createProjectSchema), asyncHandler(controller.create));
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
router.patch("/:id", validate(updateProjectSchema), asyncHandler(controller.update));
module.exports = router;