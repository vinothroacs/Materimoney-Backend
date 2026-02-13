//new change by vinoth

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
    await db("users").where({ id: user.id }).update({ status: "PENDING" });

    return {
      success: true,
      message: "Profile submitted. Waiting for admin approval",
      data: { profileId },
    };
  } catch (error) {
    console.error("Submit Profile Error namma tha:", error);
    console.error("Submit Profile Error namma tha:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

//visble connections
module.exports.getVisibleConnections = async (userId) => {
  try {
    const myProfile = await db("profiles").where({ user_id: userId }).first();

    if (!myProfile) {
      return {
        success: false,
        message: "User profile not found",
        data: [],
      };
    }

    const profiles = await db("profiles")
      .whereNot("user_id", userId)
      .andWhere("gender", "!=", myProfile.gender);

    return {
      success: true,
      message: profiles.length
        ? "Data fetched successfully"
        : "No data available",
      data: profiles,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch visible connections",
      error: error.message,
    };
  }
};

module.exports.sendConnectionRequest = async (fromUserId, profileId) => {
  try {
    /* 1️⃣ Validate input */
    if (!fromUserId || !profileId) {
      return {
        success: false,
        message: "Invalid request data",
      };
    }

    /* 2️⃣ Get TO user (profileId → user_id) */
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

    /* 3️⃣ Prevent self-connection */
    if (fromUserId === toUserId) {
      return {
        success: false,
        message: "You cannot send a connection request to yourself",
      };
    }

    /* 4️⃣ Check existing request (business logic) */
    const existing = await db("connections")
      .where({
        from_user: fromUserId,
        to_user: toUserId,
      })
      .first();

    if (existing) {
      return {
        success: false,
        message: "Connection request already sent and waiting",
      };
    }

    /* 5️⃣ Insert connection (DB safety still handled by UNIQUE key) */
    await db("connections").insert({
      from_user: fromUserId,
      to_user: toUserId,
      status: "Sent",
    });

    /* 6️⃣ Fetch FROM user profile (for response / UI) */
    const fromUserProfile = await db("profiles")
      .select("id", "full_name", "gender", "city", "country", "user_id")
      .where({ user_id: fromUserId })
      .first();

    /* 7️⃣ Fetch TO user profile */
    const toUserProfile = await db("profiles")
      .select("id", "full_name", "gender", "city", "country", "user_id")
      .where({ user_id: toUserId })
      .first();

    return {
      success: true,
      message: "Connection request sent",
      fromUser: fromUserProfile,
      toUser: toUserProfile,
    };
  } catch (error) {
    /* 8️⃣ Handle DB duplicate (race condition safety) */
    if (error.code === "ER_DUP_ENTRY") {
      return {
        success: false,
        message: "Connection request already sent and waiting",
      };
    }

    return {
      success: false,
      message: "Something went wrong while sending request",
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
  "c.from_user",
  "c.created_at",
  "p.full_name",
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
      status: "Sent",
    })
    .first();

  if (!connection) {
    return {
      success: false,
      message: "Connection not found or already accepted",
    };
  }

  await db("connections").where({ id: connectionId }).update({
    status: "Accepted",
  });

  return {
    success: true,
    message: "Connection accepted successfully",
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
      "p.country",
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
      "p.raasi as receiver_raasi",
    );

  return rows;
};

/// update profile

module.exports.updateUserProfile = async (props = {}) => {
  const { userid, ...data } = props;

  if (!userid) {
    return { success: false, message: "userid is required" };
  }

  try {
    // ✅ ONLY DB COLUMN NAMES
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
      return { success: false, message: "Profile not found" };
    }

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    // // ✅ DUPLICATE EMAIL HANDLING
    // if (error.code === "ER_DUP_ENTRY") {
    //   if (error.message.includes("profiles.email")) {
    //     return {
    //       success: false,
    //       message: "This email is already in use",
    //     };
    //   }
    // }

    return {
      success: false,
      message: error.message,
    };
  }
};

///uploadProfilePhoto
module.exports.uploadProfilePhoto = async ({ userId, file }) => {
  try {
    await db("profiles")
      .where({ user_id: userId })
      .update({ photo: file.filename });

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

/// Get user profiles

module.exports.getUserProfile = async (userId) => {
  try {
    const profile = await db("profiles").where({ user_id: userId }).first();

    if (!profile) {
      return {
        success: false,
        message: "Profile not found",
      };
    }

    return {
      success: true,
      data: {
        ...profile,
        horoscope: {
          uploaded: profile.horoscope_uploaded === 1,
          fileUrl: profile.horoscope_file_url,
          fileName: profile.horoscope_file_name,
        },
      },
    };
  } catch (error) {
    // service-level error
    return {
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    };
  }
};

// module.exports.getReceivedConnections = async (userId) => {
//   try {
//     const rows = await db("connections as c")
//       .join("users as u", "u.id", "c.from_user")
//       .select(
//         "c.id as connectionId",
//         "u.id as userId",
//         "u.name",
//         "u.email",
//         "c.created_at"
//       )
//       .where("c.to_user", userId);

//     return {
//       success: true,
//       data: rows
//     };

//   } catch (err) {
//     return {
//       success: false,
//       message: err.message
//     };
//   }
// };

// /**
//  * RECEIVED CONNECTIONS
//  */
// module.exports.getReceivedConnections = async (userId) => {
//   try {
//     const rows = await db("connections as c")
//       .join("profiles as p", "p.user_id", "c.from_user")
//       .select(
//         "c.id as connectionId",
//         "c.status",
//         "c.created_at",
//         "p.user_id",
//         "p.full_name",
//         "p.gender",
//         "p.raasi",
//         "p.occupation",
//         "p.city",
//         "p.privacy"
//       )

//     return { success: true, data: rows };
//   } catch (err) {
//     return { success: false, message: err.message };
//   }
// };

/**
 * SENT CONNECTIONS
 */
// module.exports.getSentConnections = async (userId) => {
//   try {
//     const connections = await db("connections as c")
//       .leftJoin("profiles as p", "p.user_id", "c.to_user")
//       .select(
//         "c.id as connectionId",
//         "c.status",
//         "c.created_at",

//         "c.to_user as userId",
//         "p.full_name as fullName",
//         "p.gender",
//         "p.occupation",
//         "p.city"
//       )
//       .where("c.from_user", userId);

//     return {
//       success: true,
//       data: connections
//     };

//   } catch (err) {
//     return {
//       success: false,
//       message: err.message
//     };
//   }
// };

/**
 * ACCEPT
 */
// service

// module.exports.getMyProfile = async (userId) => {
//   console.log("userId",userId)
//   try {
//     const profile = await db("profiles")
//       .where({
//         user_id: userId,
//         is_active: 1
//       })

//       .first();

//     if (!profile) {
//       return {
//         success: false,
//         message: "Profile not found"
//       };
//     }

//     return {
//       success: true,
//       data: {
//         user_id: userId,

//         id: profile.id,
//         fullName: profile.full_name,
//         gender: profile.gender,
//         dob: profile.dob,
//         birthTime: profile.birth_time,
//         maritalStatus: profile.marital_status,
//         education: profile.education,
//         occupation: profile.occupation,
//         income: profile.income,
//         email: profile.email,

//         family: {
//           fatherName: profile.father_name,
//           motherName: profile.mother_name,
//           grandfatherName: profile.grandfather_name,
//           grandmotherName: profile.grandmother_name,
//           siblings: profile.siblings
//         },

//         astrology: {
//           raasi: profile.raasi,
//           star: profile.star,
//           dosham: profile.dosham
//         },

//         horoscope: {
//           uploaded: profile.horoscope_uploaded === 1,
//           fileName: profile.horoscope_file_name,
//           fileUrl: profile.horoscope_file_url
//         },

//         religion: profile.religion,
//         caste: profile.caste,

//         address: {
//           address: profile.address,
//           city: profile.city,
//           country: profile.country
//         },

//         privacy: profile.privacy,
//         isPublic: profile.is_public === 1,
//         photo: profile.photo,
//         status: profile.status,
//         createdAt: profile.created_at
//       }
//     };

//   } catch (err) {
//     return {
//       success: false,
//       message: err.message
//     };
//   }
// };

/**
 * UPDATE PROFILE
 */

// exports.updateProfile = async (userId, props = {}) => {
//   const {
//     fullName,
//     gender,
//     dob,
//     birthTime,
//     maritalStatus,
//     education,
//     occupation,
//     income,
//     raasi,
//     star,
//     dosham,
//     father,
//     mother,
//     religion,
//     caste,
//     city,
//     country,
//     address,
//   } = props;

//   // 🔥 Build update object safely
//   const updateData = {};

//   if (fullName) updateData.full_name = fullName;
//   if (gender) updateData.gender = gender;
//   if (dob) updateData.dob = dob;
//   if (birthTime) updateData.birth_time = birthTime;
//   if (maritalStatus) updateData.marital_status = maritalStatus;
//   if (education) updateData.education = education;
//   if (occupation) updateData.occupation = occupation;
//   if (income) updateData.income = income;
//   if (raasi) updateData.raasi = raasi;
//   if (star) updateData.star = star;
//   if (dosham) updateData.dosham = dosham;
//   if (father) updateData.father_name = father;
//   if (mother) updateData.mother_name = mother;
//   if (religion) updateData.religion = religion;
//   if (caste) updateData.caste = caste;
//   if (city) updateData.city = city;
//   if (country) updateData.country = country;
//   if (address) updateData.address = address;

//   if (Object.keys(updateData).length === 0) {
//     return {
//       success: false,
//       message: "No fields to update",
//     };
//   }

//   const existingProfile = await db("profiles")
//     .where({ user_id: userId })
//     .first();

//   if (!existingProfile) {
//     return {
//       success: false,
//       message: "No profile found for this user",
//     };
//   }

//   await db("profiles")
//     .where({ user_id: userId })
//     .update(updateData);

//   return { success: true };
// };

/**
 * UPDATE PHOTO
 */
// exports.updatePhoto = async (userId, file) => {
//   try {
//     await db("profiles")
//       .where({ user_id: userId })
//       .update({
//         photo: `/uploads/photos/${file.filename}`
//       });

//     return { success: true };

//   } catch (err) {
//     return {
//       success: false,
//       message: err.message
//     };
//   }
// };

/**
 * UPDATE HOROSCOPE
 */
// exports.updateHoroscope = async (userId, file) => {
//   await db("profiles")
//     .where({ user_id: userId })
//     .update({
//       horoscope_uploaded: 1,
//       horoscope_file_name: file.originalname,
//       horoscope_file_url: `/uploads/horoscope/${file.filename}`,
//     });

//   return { success: true };
// };

/**
 * UPDATE PRIVACY
 */
// exports.updatePrivacy = async (userId, privacy) => {

/**
 * GET MY PROFILE
 */
