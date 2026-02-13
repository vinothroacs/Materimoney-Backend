const db = require("../../../config/db");
const { sendMail } = require("../../../utils/mailer");
const {
  acceptTemplate,
  rejectTemplate,
} = require("../../../utils/emailTemplates");

module.exports.getPendingForms = async () => {
  try {
    const pendingForms = await db("users").where({ status: "PENDING" });

    if (!pendingForms || pendingForms.length === 0) {
      return {
        success: false,
        message: "No pending forms found",
      };
    }

    return {
      success: true,
      message: "Pending forms fetched successfully",
      data: pendingForms || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// REJECT USER + NOTIFICATION

module.exports.rejectUser = async (userId) => {
  try {
    // 🔴 ONLY status update using ID
    const updated = await db("users").where({ id: userId }).update({
      status: "REJECTED",
    });

    if (!updated) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // 🔔 Notification insert (optional but recommended)
    await db("notifications").insert({
      user_id: userId, // users.id
      type: "ADMIN_REJECT",
      message: "Your profile was rejected by admin",
      is_read: 0,
      created_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 🔹 COMMON MAPPER (snake_case → camelCase)
const mapProfile = (p) => ({
  id: p.id,
  fullName: p.full_name,
  gender: p.gender,
  dob: p.dob,
  birthTime: p.birth_time,
  maritalStatus: p.marital_status,

  education: p.education,
  occupation: p.occupation,
  income: p.income,

  email: p.email,

  father: p.father_name,
  mother: p.mother_name,
  grandfather: p.grandfather_name,
  grandmother: p.grandmother_name,
  siblings: p.siblings,

  raasi: p.raasi,
  star: p.star,
  dosham: p.dosham,
  birthPlace: p.birth_place,

  religion: p.religion,
  caste: p.caste,

  address: p.address,
  city: p.city,
  country: p.country,

  privacy: p.privacy,
  isPublic: Boolean(p.is_public),
  photo: p.photo,

  horoscope: {
    uploaded: Boolean(p.horoscope_uploaded),
    fileName: p.horoscope_file_name,
    fileUrl: p.horoscope_file_url,
  },

  status: p.status,
  createdAt: p.created_at,
  is_active: Number(p.is_active),
});

// 🔹 GET ALL USERS
module.exports.getAllUsers = async () => {
  try {
    const rows = await db("profiles").select("*");
    return {
      success: true,
      data: rows.map(mapProfile),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// 🔹 GET PENDING USERS
module.exports.getPendingUsers = async () => {
  try {
    const rows = await db("profiles")
      .where({ status: "NEW" })
      .orderBy("created_at", "desc");

    return {
      success: true,
      data: rows.map(mapProfile),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports.adminApproveUser = async (userId) => {
  try {
    const id = Number(userId);

    // 1️⃣ find profile using user_id
    const profile = await db("profiles").where({ user_id: id }).first();

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    // 2️⃣ find user
    const user = await db("users").where({ id }).first();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // 3️⃣ update both tables
    await db("profiles").where({ user_id: id }).update({ status: "ACTIVE" });

    await db("users").where({ id }).update({ status: "ACTIVE" });

    // 4️⃣ send mail
    await sendMail({
      to: user.email,
      subject: "Welcome to Kalyanamalai 💍",
      html: acceptTemplate(profile.full_name),
    });

    return { success: true };
  } catch (err) {
    console.error("Approve error:", err);
    return { success: false, message: "Approve failed" };
  }
};

module.exports.adminRejectUser = async (userId, reason) => {
  try {
    const id = Number(userId);

    console.log("SERVICE profileId 👉", id);
    console.log("SERVICE reason 👉", reason);

    // 1️⃣ Get profile
    const profile = await db("profiles")
      .where({ user_id :id })
      .first();

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    // 2️⃣ Get user
    const user = await db("users")
      .where({ id: profile.user_id })
      .first();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // 3️⃣ Update DB first (important for speed)
    await db("profiles")
      .where({ id })
      .update({ status: "REJECTED" });

    await db("users")
      .where({ id: user.id })
      .update({ status: "REJECTED" });

    // 4️⃣ Send mail in background (non-blocking)
    setImmediate(() => {
      sendMail({
        to: user.email,
        subject: "Profile Update – Kalyanamalai",
        html: rejectTemplate(profile.full_name, reason),
      }).catch((err) => {
        console.error("Mail error 👉", err);
      });
    });

    return { success: true };

  } catch (err) {
    console.error("SERVICE ERROR 👉", err);
    return { success: false, message: "Reject failed" };
  }
};


// 👁 TOGGLE VISIBILITY
// services/admin.service.js
module.exports.adminToggleVisibility = async (props = {}) => {
  const { id, key } = props;

  if (id === undefined || key === undefined) {
    return {
      success: false,
      message: "id and key are required",
    };
  }

  try {
    const profile = await db("profiles").where({ id }).first();

    if (!profile) {
      return {
        success: false,
        message: "Profile not found",
      };
    }

    const newValue = key ? 1 : 0;

    await db("profiles").where({ id }).update({ is_active: newValue });

    return {
      success: true,
      is_active: newValue,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};

// ================= DASHBOARD STATS =================
module.exports.getAdminDashboardStats = async () => {
  try {
    // Total profiles
    const [{ totalUsers }] = await db("profiles").count("id as totalUsers");

    // Active profiles (status = ACTIVE)
    const [{ activeUsers }] = await db("profiles")
      .where({ is_active: 1 })
      .count("id as activeUsers");

    // Inactive profiles (status != ACTIVE)
    const [{ inactiveUsers }] = await db("profiles")
      .where({ is_active: 0 })
      .count("id as inactiveUsers");

    // Male count
    const [{ maleUsers }] = await db("profiles")
      .whereRaw("LOWER(gender) = ?", ["male"])
      .count("id as maleUsers");

    // Female count
    const [{ femaleUsers }] = await db("profiles")
      .whereRaw("LOWER(gender) = ?", ["female"])
      .count("id as femaleUsers");

    return {
      success: true,
      data: {
        totalUsers: Number(totalUsers),
        activeUsers: Number(activeUsers),
        inactiveUsers: Number(inactiveUsers),
        maleUsers: Number(maleUsers),
        femaleUsers: Number(femaleUsers),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};


// 🔹 GET SINGLE USER PROFILE
module.exports.getSingleUser = async (userId) => {
  try {
    const id = Number(userId);

    const profile = await db("profiles")
      .where({ user_id: id })
      .first();

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    return {
      success: true,
      data: mapProfile(profile),
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
};
