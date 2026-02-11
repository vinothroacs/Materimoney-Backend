const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const { adminToggleVisibility } = require("../services/index");

// Pending forms
router.get("/forms/pending", controller.getPendingForms);

// Reject user
router.put("/reject/:id", controller.rejectUser);

// Accept user
router.put("/approve/:id", controller.acceptUser);

// 🟢 Get all users (AllUsers table)
router.get("/users", controller.getAllUsers);

// 🟡 Get pending users
router.get("/users/pending", controller.getPendingUsers);

// ✅ Approve user (ADMIN)
router.put("/users/:id/approve", controller.adminApproveUser);

// ❌ Reject user (ADMIN)
router.put("/users/:id/reject", controller.adminRejectUser);

// 👁 Toggle public / private
router.put('/users/visibility', controller.adminToggleVisibility);



// 🔹 DASHBOARD STATS
router.get("/dashboard", controller.getAdminDashboard);

module.exports = router;
