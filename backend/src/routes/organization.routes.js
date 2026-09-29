const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { organizationSchema, addMemberSchema } = require("../validators/organization.validator");
const controller = require("../controllers/organization.controller");

router.use(requireAuth);
router.post("/", validate(organizationSchema), asyncHandler(controller.create));
router.get("/:id", asyncHandler(controller.getOne));
router.get("/:id/members", asyncHandler(controller.members));
router.post("/:id/members", validate(addMemberSchema), asyncHandler(controller.addMember));
module.exports = router;