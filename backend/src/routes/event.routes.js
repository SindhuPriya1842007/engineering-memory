const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { eventSchema, batchEventSchema } = require("../validators/event.validator");
const controller = require("../controllers/event.controller");

router.use(requireAuth);
router.post("/", validate(eventSchema), asyncHandler(controller.create));
router.post("/batch", validate(batchEventSchema), asyncHandler(controller.createBatch));
module.exports = router;