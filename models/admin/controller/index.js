const adminService = require("../services/index");

module.exports.getPendingForms = async (req, res) => {
  try {
    const result = await adminService.getPendingForms();

    return res.status(200).json({
      success: true,
      message: "Pending forms fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get Pending Forms Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending forms",
    });
  }
};

// 🔹 GET ALL USERS
module.exports.getAllUsers = async (req, res) => {
  try {
    const result = await adminService.getAllUsers();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// 🔹 GET PENDING USERS
module.exports.getPendingUsers = async (req, res) => {
  try {
    const result = await adminService.getPendingUsers();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending users",
    });
  }
};

// controller
module.exports.adminApproveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.adminApproveUser(id);

    if (!result.success) return res.status(400).json(result);

    res.json({ success: true, message: "Profile approved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Approve failed" });
  }
};

module.exports.adminRejectUser = async (req, res) => {
  try {
    console.log("PARAMS 👉", req.params);
    console.log("BODY 👉", req.body);
    const { id } = req.params;
    const { reason } = req.body;

    const result = await adminService.adminRejectUser(id, reason);

    if (!result.success) return res.status(400).json(result);

    res.json({ success: true, message: "Profile rejected successfully" });
  } catch (err) {
    console.error("CONTROLLER ERROR 👉", err);
    res.status(500).json({ success: false, message: "Reject failed" });
  }
};

// 👁 TOGGLE VISIBILITY
module.exports.adminToggleVisibility = async (req, res) => {
  try {
    const { id, key } = req.body;

    const response = await adminService.adminToggleVisibility({
      id,
      key,
    });

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DASHBOARD =================
module.exports.getAdminDashboard = async (req, res) => {
  try {
    const result = await adminService.getAdminDashboardStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};


exports.getSingleUser = async (req, res) => {
  try {
    const result = await adminService.getSingleUser(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};


