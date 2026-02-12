const db = require("../../../config/db");

// 🔄 Convert 12h → 24h
function convertTo24Hour(time12h) {
  if (!time12h) return null;
  if (/^\d{2}:\d{2}$/.test(time12h)) return time12h;

  const parts = time12h.trim().split(" ");
  if (parts.length !== 2) return null;

  let [hours, minutes] = parts[0].split(":");
  const period = parts[1].toUpperCase();

  hours = parseInt(hours, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

module.exports.submitProfile = async (payload, files, user) => {
  try {
    const insertData = {
      user_id: user.id,

      full_name: payload.fullName,
      gender: payload.gender,
      dob: payload.dob,
      birth_time: convertTo24Hour(payload.birthTime),
      marital_status: payload.maritalStatus,

      education: payload.education,
      occupation: payload.occupation,
      income: payload.income,

      email: user.email,

      father_name: payload.father,
      mother_name: payload.mother,
      grandfather_name: payload.grandfather,
      grandmother_name: payload.grandmother,
      siblings: payload.siblings,

      raasi: payload.raasi,
      star: payload.star,
      dosham: payload.dosham || "No",

      birth_place: payload.city,

      religion: payload.religion,
      caste: payload.caste,

      address: payload.address,
      city: payload.city,
      country: payload.country,

      privacy: payload.privacy,
      is_public: payload.privacy === "Public" ? 1 : 0,

      horoscope_uploaded: files?.horoscope ? 1 : 0,
      horoscope_file_name: files?.horoscope?.[0]?.filename || null,
      horoscope_file_url: files?.horoscope
        ? `/uploads/horoscope/${files.horoscope[0].filename}`
        : null,

      photo: files?.photo?.[0]?.filename || null,

      is_active: 1,
    };

    console.log("USER FROM JWT 👉", user);

    // ✅ Duplicate profile check (email-based)
    const existingProfile = await db("profiles")
      .where({ email: user.email })
      .first();

    if (existingProfile) {
      return {
        success: false,
        message: "Profile already submitted for this user",
      };
    }

    // ✅ Insert profile

    const [profileId] = await db("profiles").insert(insertData);
    console.log("test id ", profileId);

    // ✅ Update user status using userid from JWT
    await db("users").where({ id: user.id }).update({ status: "PENDING" });

    return {
      success: true,
      message: "Profile submitted. Waiting for admin approval",
      data: { profileId },
    };
  } catch (error) {
    console.error("Submit Profile Error namma tha:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};


//visble connections
module.exports.getVisibleConnections = async (userId) => {
  const myProfile = await db("profiles")
    .where("user_id", userId)
    .first();

  const profiles = await db("profiles")
    .whereNot("user_id", userId)
    .andWhere("gender", "!=", myProfile.gender);

  return {
    success: true,
    data: profiles,
    message: profiles.length
      ? "Data fetched successfully"
      : "No data available",
  };
};


module.exports.sendConnectionRequest = async (fromUserId, profileId) => {
  try {
    // 1. Get profile → user mapping
    const profile = await db("profiles")
      .select("user_id")
      .where({ id: profileId })
      .first();

    if (!profile || !profile.user_id) {
      return {
        success: false,
        message: "Profile not found or inactive",
      };
    }

    const toUserId = profile.user_id;

    // 3. Ensure target user exists
    const userExists = await db("users")
      .where({ id: toUserId, is_active: 1 })
      .first();

    if (!userExists) {
      return {
        success: false,
        message: "User does not exist",
      };
    }

    // 4. Check duplicate request
    const existing = await db("connections")
      .where({
        from_user: fromUserId,
        to_user: toUserId,
      })
      .first();

    if (existing) {
      return {
        success: false,
        message: "Connection request already sent",
      };
    }

    // 5. Create request
    await db("connections").insert({
      from_user: fromUserId,
      to_user: toUserId,
      status: "Sent",
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// /**
//  * WITHDRAW (SENDER ONLY)
//
module.exports.withdrawConnection = async (connectionId, userId) => {
  try {
    // make sure number
    connectionId = Number(connectionId);

    // delete only if sender + status Sent
    const deletedCount = await db("connections")
      .where({
        id: connectionId,
        status: "Sent",
      })
      .del();

    if (!deletedCount) {
      return {
        success: false,
        message: "Connection not found or not allowed to delete",
      };
    }

    return {
      success: true,
      message: "Connection withdrawn successfully",
    };

  } catch (err) {
    return { success: false, message: err.message };
  }
};


//   await db("profiles")
//     .where({ user_id: userId })
//     .update({
//       privacy,
//       is_public: privacy === "Public" ? 1 : 0,
//     });

//   return { success: true };
// };

// My connection from user

module.exports.getReceivedConnections = async (userId) => {
  const rows = await db("connections as c")
    .join("profiles as p", "p.user_id", "c.from_user")
    .where("c.to_user", userId)
    .where("c.status", "Sent")
    .select(
      "c.id as connectionId",
      "c.created_at",
      "p.raasi",
      "p.gender",
      "p.income",
      "p.occupation",
      "p.city",
    );

  return rows;
};

// GET SENT CONNECTIONS

module.exports.acceptConnection = async (connectionId, userId) => {

  const connection = await db("connections")
    .where({
      id: connectionId,
      to_user: userId,
      status: "Sent"
    })
    .first();

  if (!connection) {
    return {
      success: false,
      message: "Connection not found or already accepted"
    };
  }

  await db("connections")
    .where({ id: connectionId })
    .update({
      status: "Accepted"
    });

  return {
    success: true,
    message: "Connection accepted successfully"
  };
};


module.exports.getAcceptedConnections = async (userId) => {

  const rows = await db("connections as c")
    .join("profiles as p", "p.user_id", "c.from_user")

    .where("c.to_user", userId)
    .where("c.status", "Accepted")

    // auto expire after 24 hrs

    .select(
      "c.id as connectionId",
      "c.created_at",
      "p.user_id",
      "p.full_name",
      "p.gender",
      "p.income",
      "p.occupation",
      "p.city",
      "p.country"
    );

  return rows;
};


/// REJECT CONNECTIONS

module.exports.rejectConnection = async (connectionId, userId) => {
  // only receiver (to_user) can reject
  const connection = await db("connections")
    .where({
      id: connectionId,
      to_user: userId,
      status: "Sent",
    })
    .first();

  if (!connection) {
    return {
      success: false,
      message: "Connection not found or already processed",
    };
  }

  await db("connections")
    .where({ id: connectionId })
    .update({ status: "Rejected" });

  return {
    success: true,
    message: "Connection rejected successfully",
  };
};

//get sentconnections
module.exports.getSentConnections = async (userId) => {
  const rows = await db("connections as c")
    .leftJoin("profiles as p", "p.user_id", "c.to_user")

    .where("c.from_user", userId)
    .andWhere("c.created_at", ">=", db.raw("NOW() - INTERVAL 24 HOUR"))

    .select(
      "c.id as connectionId",
      "c.status",
      "c.created_at",

      "p.user_id as receiver_id",
      "p.full_name as receiver_name",
      "p.income as receiver_salary",
      "p.occupation as receiver_work",
      "p.city as receiver_city",
      "p.country as receiver_country",
      "p.raasi as receiver_raasi"
    );

  return rows;
};


/// update profile

module.exports.updateUserProfile = async (props = {}) => {
  const { userid, ...data } = props;

  if (!userid) {
    return {
      success: false,
      message: "userid is required",
    };
  }

  try {
    // ✅ Only allow these fields to update
    const allowedFields = [
      "full_name",
      "gender",
      "dob",
      "birth_time",
      "marital_status",
      "education",
      "occupation",
      "income",
      "email",
      "father_name",
      "mother_name",
      "grandfather_name",
      "grandmother_name",
      "siblings",
      "raasi",
      "star",
      "dosham",
      "birth_place",
      "horoscope_uploaded",
      "horoscope_file_name",
      "horoscope_file_url",
      "religion",
      "caste",
      "address",
      "city",
      "country",
      "privacy",
      "photo",
      "is_public",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // ✅ Fix DOB format
    if (updateData.dob) {
      updateData.dob = updateData.dob.split("T")[0];
    }

    const updated = await db("profiles")
      .where({ user_id: userid })
      .update(updateData);

    if (!updated) {
      return {
        success: false,
        message: "Profile not found",
      };
    }

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

///uploadProfilePhoto
module.exports.uploadProfilePhoto = async ({ userId, file }) => {
  try {
    await db("profiles").where({ user_id: userId }).update({
      photo: file.filename, // ✅ ONLY THIS
    });

    return {
      success: true,
      message: "Profile photo uploaded successfully",
      photo: file.filename,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports.getUserProfileService = async (user_id) => {
  try {
    const profile = await db("profiles").where({ user_id }).first();

    if (!profile) {
      return {
        success: false,
        message: "Profile not found",
      };
    }

    return {
      success: true,
      message: "Profile data fetched successfully",
      data: profile,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

// uploadHoroscope
module.exports.uploadHoroscope = async ({ userId, file }) => {
  try {
    await db("profiles").where({ user_id: userId }).update({
      horoscope_file_name: file.originalname,
      horoscope_file_url: file.filename,
      horoscope_uploaded: 1,
    });

    return {
      success: true,
      message: "Horoscope uploaded successfully",
      fileName: file.originalname,
      fileUrl: file.filename,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
