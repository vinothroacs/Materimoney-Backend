
// // module.exports.submitProfile = async (payload, files, userid) => {
// //   try {
// //     const insertData = {
// //       full_name: payload.fullName,
// //       gender: payload.gender,
// //       dob: payload.dob,
// //       birth_time: convertTo24Hour(payload.birthTime),

// //       marital_status: payload.maritalStatus,
// //       education: payload.education,
// //       occupation: payload.occupation,
// //       income: payload.income,

// //       email: payload.email,

// //       father_name: payload.father,
// //       mother_name: payload.mother,
// //       grandfather_name: payload.grandfather,
// //       grandmother_name: payload.grandmother,
// //       siblings: payload.siblings,

// //       raasi: payload.raasi,
// //       star: payload.star,
// //       dosham: payload.dosham,
// //       birth_place: payload.city,

// //       religion: payload.religion,
// //       caste: payload.caste,

// //       address: payload.address,
// //       city: payload.city,
// //       country: payload.country,
// //       privacy: payload.privacy,

// //       horoscope_uploaded:
// //         files?.horoscope || payload.horoscope_uploaded ? 1 : 0,

// //       horoscope_file_name:
// //         files?.horoscope
// //           ? files.horoscope[0].originalname
// //           : payload.horoscope_file_name || null,

// //       horoscope_file_url:
// //         files?.horoscope
// //           ? `/uploads/horoscope/${files.horoscope[0].originalname}`
// //           : payload.horoscope_file_url || null,

// //       photo:
// //         files?.photo
// //           ? files.photo[0].originalname
// //           : payload.photo || null,

// //       is_public: payload.privacy === "Public" ? 1 : 0,
// //       created_at: new Date(),
// //     };

// //     // 1️⃣ Insert profile
// //     const [profileId] = await db("profiles").insert(insertData);

// //     // 2️⃣ 🔥 UPDATE USER STATUS → PENDING
// //     await db("users")
// //       .where({ id: userid })
// //       .update({ status: "PENDING" });

// //     return {
// //       success: true,
// //       message: "Profile submitted. Waiting for admin approval",
// //       data: { profileId },
// //     };
// //   } catch (error) {
// //     console.error("Submit Profile Error:", error);
// //     return {
// //       success: false,
// //       message: error.message,
// //     };
// //   }
// // };



// const db = require("../../../config/db");

// function convertTo24Hour(time12h) {
//   if (!time12h) return null;
//   if (/^\d{2}:\d{2}$/.test(time12h)) return time12h;

//   const parts = time12h.trim().split(" ");
//   if (parts.length !== 2) return null;

//   let [hours, minutes] = parts[0].split(":");
//   const period = parts[1].toUpperCase();

//   hours = parseInt(hours, 10);
//   if (period === "PM" && hours !== 12) hours += 12;
//   if (period === "AM" && hours === 12) hours = 0;

//   return `${hours.toString().padStart(2, "0")}:${minutes}`;
// }

// module.exports.submitProfile = async (payload, files, user) => {
//   console.log("user test",user)
//   try {

//     // 🔴 DUPLICATE CHECK
//     const existingProfile = await db("profiles")
//       .where({user_id: user.id})
//       .first();

//     if (existingProfile) {
//       return {
//         success: false,
//         message: "Profile already submitted for this email",
//       };
//     }
    

//     const insertData = {
      
//       full_name: payload.fullName,
//       gender: payload.gender,
//       dob: payload.dob,
//       birth_time: convertTo24Hour(payload.birthTime),
//       marital_status: payload.maritalStatus,
//       education: payload.education,
//       occupation: payload.occupation,
//       income: payload.income,
//       email: payload.email,
//       father_name: payload.father,
//       mother_name: payload.mother,
//       grandfather_name: payload.grandfather,
//       grandmother_name: payload.grandmother,
//       siblings: payload.siblings,
//       raasi: payload.raasi,
//       star: payload.star,
//       dosham: payload.dosham,
//       birth_place: payload.city,
//       religion: payload.religion,
//       caste: payload.caste,
//       address: payload.address,
//       city: payload.city,
//       country: payload.country,
//       privacy: payload.privacy,
//       horoscope_uploaded:
//         (files?.horoscope || payload.horoscope_uploaded) ? 1 : 0,
//       horoscope_file_name:
//         files?.horoscope
//           ? files.horoscope[0].originalname
//           : payload.horoscope_file_name || null,
//       horoscope_file_url:
//         files?.horoscope
//           ? `/uploads/horoscope/${files.horoscope[0].originalname}`
//           : payload.horoscope_file_url || null,
//       photo:
//         files?.photo
//           ? files.photo[0].originalname
//           : payload.photo || null,
//       is_public: payload.privacy === "Public" ? 1 : 0,
//       created_at: new Date(),
//     };

//     const [profileId] = await db("profiles").insert(insertData);

//     await db("users")
//       .where({ id: user.id })   // 🔥 FIX
//       .update({ status: "PENDING" });

//     return {
//       success: true,
//       message: "Profile submitted. Waiting for admin approval",
//       data: { profileId },
//     };
//   } catch (error) {
//     console.error("Submit Profile Error:", error);
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// };



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
    const insertData = {
      full_name: payload.fullName,
      gender: payload.gender,
      dob: payload.dob,
      birth_time: convertTo24Hour(payload.birthTime),
      marital_status: payload.maritalStatus,
      education: payload.education,
      occupation: payload.occupation,
      income: payload.income,

      // 🔒 Always trust JWT
      email: user.email,

      father_name: payload.father,
      mother_name: payload.mother,
      grandfather_name: payload.grandfather,
      grandmother_name: payload.grandmother,
      siblings: payload.siblings,

      raasi: payload.raasi,
      star: payload.star,
      dosham: payload.dosham,
      birth_place: payload.city,

      religion: payload.religion,
      caste: payload.caste,

      address: payload.address,
      city: payload.city,
      country: payload.country,

      privacy: payload.privacy,

      horoscope_uploaded: files?.horoscope ? 1 : 0,
      horoscope_file_name: files?.horoscope?.[0]?.originalname || null,
      horoscope_file_url: files?.horoscope
        ? `/uploads/horoscope/${files.horoscope[0].originalname}`
        : null,

      photo: files?.photo?.[0]?.originalname || null,

      is_public: payload.privacy === "Public" ? 1 : 0,
      created_at: new Date(),
    };

    const [profileId] = await db("profiles").insert(insertData);

    // ✅ Update user status using userid from JWT
    await db("users")
      .where({ id: user.userid })
      .update({ status: "PENDING" });

    return {
      success: true,
      message: "Profile submitted. Waiting for admin approval",
      data: { profileId },
    };
  } catch (error) {
    console.error("Submit Profile Error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};


