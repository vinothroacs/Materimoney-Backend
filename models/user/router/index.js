// const express = require("express");
// const router = express.Router();
// const controller = require("../controller/index");
// const {uploadPhoto,uploadHoroscope} = require("../../../middleware/upload"); // 👈 ADD THIS
// const authmiddleware = require("../../../middleware/authmiddleware");

// const multerFields = [
//   { name: "photo", maxCount: 1 },
//   { name: "horoscope", maxCount: 1 },
// ];

// router.post("/form/submit", authmiddleware, (req, res, next) => {
//   // combine storage logic in a single multer instance
//   const combinedUpload = require("multer")({
//     storage: require("multer").diskStorage({
//       destination: (req, file, cb) => {
//         if (file.fieldname === "photo") cb(null, "uploads/photos");
//         else if (file.fieldname === "horoscope") cb(null, "uploads/horoscope");
//         else cb(new Error("Unknown field"), null);
//       },
//       filename: (req, file, cb) => {
//         const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + require("path").extname(file.originalname);
//         cb(null, uniqueName);
//       },
//     }),
//     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
//   }).fields(multerFields);

//   combinedUpload(req, res, function (err) {
//     if (err) return next(err);
//     next();
//   });
// }, controller.submitProfile);


// //connection card

// router.get("/connections",authmiddleware, controller.getVisibleConnections);

// router.get("/profile/:id",authmiddleware,controller.getUserProfile);
// router.post("/connection",authmiddleware,controller.sendConnectionRequest);
// router.get("/get-connection",authmiddleware,controller.getReceivedConnections);



// //my connection

// router.get("/connections/received",authmiddleware, controller.getReceivedConnections);

// //medhod change
// router.get("/connections/sent",authmiddleware, controller.getSentConnections);

// router.post("/connections/:id/accept",authmiddleware, controller.acceptConnection);
// router.post("/connections/:id/reject",authmiddleware,controller.rejectConnection);

// router.delete("/connections/:id",authmiddleware, controller.withdrawConnection)


// // GET my profile
// router.get("/profile",authmiddleware, controller.getMyProfile);

// // UPDATE profile (text fields)
// router.put("/profile",authmiddleware, controller.updateProfile);

// // UPDATE photo
// // router.put(
// //   "/profile/photo",
// //   authmiddleware,
// //   upload.single("photo"),
// //   controller.updatePhoto
// // );


// // // UPDATE horoscope
// // router.put(
// //   "/profile/horoscope",
// //   authmiddleware,
// //   upload.single("horoscope"),authmiddleware,
// //   controller.updateHoroscope
// // );

// // // UPDATE privacy
// // router.patch("/profile/privacy", authmiddleware, controller.updatePrivacy);


// module.exports = router;


//new changes

const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const upload = require("../../../middleware/upload"); // 👈 ADD THIS
const authMiddleware = require("../../../middleware/authmiddleware");
// =======
const path=require("path") // 👈 ADD THIS
// const authMiddleware= require("../../../middleware/authmiddleware")

router.post(
  "/form/submit",
  authMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "horoscope", maxCount: 1 },
  ]),
  controller.submitProfile,
);

//connection card

router.get("/connections", authMiddleware, controller.getVisibleConnections);

// <<<<<<< HEAD
// // router.get("/profile/:id", authMiddleware, controller.getUserProfile);
// =======
// router.get("/profile", authMiddleware, controller.getUserProfile);

// >>>>>>> c5a6678e50b2f4535160c6ca054d6580069718e4
// router.post("/connection", authMiddleware, controller.sendConnectionRequest);

//My connection user

/// GET RECEIVED CONNECTIONS
router.get(
  "/connections/received",
  authMiddleware,
  controller.getReceivedConnections,
);

// <<<<<<< HEAD
// // 📤 Get Sent Connections
// =======
// // 📤 Get Sent Connections0000
// >>>>>>> c5a6678e50b2f4535160c6ca054d6580069718e4
// router.get("/connections/sent", authMiddleware, controller.getSentConnections);

//acoect connection
router.post(
  "/connections/:id/accept",
  authMiddleware,
  controller.acceptConnection
);


//acoect connection get
router.get(
  "/connections/accepted",
  authMiddleware,
  controller.getAcceptedConnections
);


// ❌ Reject Connection
router.post(
  "/connections/:id/reject",
  authMiddleware,
  controller.rejectConnection,
);

router.delete(
  "/connections/:connectionId/withdraw",
  authMiddleware,
  controller.withdrawConnection,
);



// update profile
router.put("/profile/update", authMiddleware,controller.updateUserProfile);


const safeUploadProfilePhoto =
  typeof controller.uploadProfilePhoto === "function"
    ? controller.uploadProfilePhoto
    : (req, res) =>
        res.status(501).json({
          success: false,
          message: "Profile photo upload not implemented",
        });

// Update  Photo

router.put(
  "/profile/photo",
  authMiddleware,
  upload.single("photo"),
  safeUploadProfilePhoto
);




///horoscope
const safeUploadHoroscope =
  typeof controller.uploadHoroscope === "function"
    ? controller.uploadHoroscope
    : (req, res) =>
        res.status(501).json({
          success: false,
          message: "Horoscope upload not implemented",
        });

// Upload Horoscope
router.put(
  "/profile/horoscope",
  authMiddleware,
  upload.single("horoscope"),
  safeUploadHoroscope
);


module.exports = router;




