const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { recallSchema, reflectSchema } = require("../validators/memory.validator");
const controller = require("../controllers/memory.controller");

router.use(requireAuth);
router.post("/recall", validate(recallSchema), asyncHandler(controller.recall));
router.post("/reflect", validate(reflectSchema), asyncHandler(controller.reflect));
module.exports = router;