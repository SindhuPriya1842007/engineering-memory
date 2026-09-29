const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const controller = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), asyncHandler(controller.register));
router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));
module.exports = router;