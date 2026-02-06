const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const upload = require("../../../middleware/upload"); // 👈 ADD THIS
const authmiddleware = require("../../../middleware/authmiddleware");

router.post(
  "/form/submit",
  authmiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "horoscope", maxCount: 1 },
  ]),
  controller.submitProfile
);

//connection card

router.get("/connections",authmiddleware, controller.getVisibleConnections);
router.get("/profile/:id",authmiddleware,controller.getUserProfile);
router.post("/sendconnection",authmiddleware,controller.sendConnectionRequest);
router.get("/get-connection",authmiddleware,controller.getReceivedConnections);

//my connection

router.get("/connections/received",authmiddleware, controller.getReceivedConnections);
router.get("/connections/sent",authmiddleware, controller.getSentConnections);

router.post("/connections/:id/accept",authmiddleware, controller.acceptConnection);
router.post("/connections/:id/reject",authmiddleware,controller.rejectConnection);

router.delete("/connections/:id",authmiddleware, controller.withdrawConnection)


// GET my profile
router.get("/profile",authmiddleware, controller.getMyProfile);

// UPDATE profile (text fields)
router.put("/updateprofile",authmiddleware, controller.updateProfile);

// // UPDATE photo
// router.put(
//   "/profile/photo",
//   authmiddleware,
//   upload.single("photo"),authmiddleware,
//   controller.updatePhoto
// );

// // UPDATE horoscope
// router.put(
//   "/profile/horoscope",
//   authmiddleware,
//   upload.single("horoscope"),authmiddleware,
//   controller.updateHoroscope
// );

// // UPDATE privacy
// router.patch("/profile/privacy", authmiddleware, controller.updatePrivacy);


module.exports = router;
