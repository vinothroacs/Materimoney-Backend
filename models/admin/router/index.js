const express = require("express");
const router = express.Router();

const { approveUserForm } = require("../controller");
const { verifyToken, authorizeRoles } = require("../../../middleware/auth.middleware");
router.put(
  "/reject/:formId",
  verifyToken,
  authorizeRoles(1), // 🔥 ADMIN ONLY
  rejectUserForm
);


module.exports = router;
