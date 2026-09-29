const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth.middleware");
const controller = require("../controllers/experience.controller");

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getOne));
module.exports = router;