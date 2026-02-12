const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const upload = require("../../../middleware/upload");
const path=require("path") // 👈 ADD THIS
const authMiddleware= require("../../../middleware/authmiddleware")

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

router.get("/profile", authMiddleware, controller.getUserProfile);

router.post("/connection", authMiddleware, controller.sendConnectionRequest);

//My connection user

/// GET RECEIVED CONNECTIONS
router.get(
  "/connections/received",
  authMiddleware,
  controller.getReceivedConnections,
);

// 📤 Get Sent Connections0000
router.get("/connections/sent", authMiddleware, controller.getSentConnections);

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



