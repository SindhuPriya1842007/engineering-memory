const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { recallSchema } = require("../validators/memory.validator");
const controller = require("../controllers/memory.controller");

router.use(requireAuth);
router.post("/recall", validate(recallSchema), asyncHandler(controller.recall));
module.exports = router;