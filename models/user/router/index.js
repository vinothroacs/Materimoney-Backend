//new changes

const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const upload = require("../../../middleware/upload"); // 👈 ADD THIS
const authMiddleware = require("../../../middleware/authmiddleware");
const path = require("path"); // 👈 ADD THIS


//form submit

router.post(
  "/form/submit",
  authMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "horoscope", maxCount: 1 },
  ]),
  controller.submitProfile,
);

/// GET RECEIVED CONNECTIONS
router.get(
  "/connections/received",
  authMiddleware,
  controller.getReceivedConnections,
);

//acoect connection
router.post(
  "/connections/:id/accept",
  authMiddleware,
  controller.acceptConnection,
);

//acoect connection get
router.get(
  "/connections/accepted",
  authMiddleware,
  controller.getAcceptedConnections,
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
router.put("/profile/update", authMiddleware, controller.updateUserProfile);

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
  safeUploadProfilePhoto,
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
  safeUploadHoroscope,
);




// My connectioncard Router

///connections/visible

router.get(
  "/connections/visible",
  authMiddleware,
  controller.getVisibleConnections
);

// get userprofile
router.get("/profile/:id", authMiddleware, controller.getUserProfile);

// Send connection request
router.post(
  "/connections/request",
  authMiddleware,
  controller.sendConnectionRequest
);



module.exports = router;

// router.get("/get-connection",authMiddleware,controller.getReceivedConnections);

//my connection

// router.get("/connections/received",authMiddleware, controller.getReceivedConnections);

// //medhod change
// router.get("/connections/sent",authMiddleware, controller.getSentConnections);

// router.post("/connections/:id/accept",authMiddleware, controller.acceptConnection);
// router.put("/connections/:id/reject",authMiddleware,controller.rejectConnection);

// router.delete("/connections/:id",authMiddleware, controller.withdrawConnection)

// GET my profile
// router.get("/profile",authMiddleware, controller.getMyProfile);

// // UPDATE profile (text fields)
// router.put("/profile",authMiddleware, controller.updateProfile);

// UPDATE photo
// router.put(
//   "/profile/photo",
//   authMiddleware,
//   upload.single("photo"),
//   controller.updatePhoto
// );

// // UPDATE horoscope
// router.put(
//   "/profile/horoscope",
//   authMiddleware,
//   upload.single("horoscope"),authMiddleware,
//   controller.updateHoroscope
// );

// // UPDATE privacy
// router.patch("/profile/privacy", authMiddleware, controller.updatePrivacy);
