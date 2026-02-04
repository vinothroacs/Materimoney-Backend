const express = require("express");
const router = express.Router();
const controller = require("../controller");
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

module.exports = router;
