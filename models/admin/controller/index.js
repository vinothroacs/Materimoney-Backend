const adminService = require("../services/index");

// const { sendMail } = require("../../../utils/mailer");
// const { acceptTemplate } = require("../../../utils/emailTemplates");



module.exports.getPendingForms = async (req, res) => {
  try {
    const result = await adminService.getPendingForms();

    return res.status(200).json({
      success: true,
      message: "Pending forms fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Get Pending Forms Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending forms"
    });
  }
};

// REJECT USER
module.exports.rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    const result = await adminService.rejectUser(userId, reason);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "User rejected successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject user",
    });
  }
};


// ACCEPT USER
module.exports.acceptUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await adminService.acceptUser(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve user",
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

// ✅ ADMIN APPROVE
// module.exports.adminApproveUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await adminService.adminApproveUser(id);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile approved successfully",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Approve failed",
//     });
//   }
// };



// module.exports.adminRejectUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await adminService.adminRejectUser(id);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile rejected successfully",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Reject failed",
//     });
//   }
// };

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
    const { id } = req.params;
    const result = await adminService.adminToggleVisibility(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Visibility updated",
      isPublic: result.isPublic,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Visibility update failed",
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
