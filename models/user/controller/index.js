const service = require("../services/index");
const db = require("../../../config/db");


module.exports.submitProfile = async (req, res) => {
  console.log("SUBMIT BODY 👉", req.body);
  console.log("USER FROM TOKEN 👉", req.user);

  const userId = req.user.id;
  console.log(req.user);

  try {
    const response = await service.submitProfile(req.body, req.files, req.user);

    if (!response.success) {
      return res.status(400).json({
        success: false,
        message: response.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: response.message,
      data: response.data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.getVisibleConnections = async (req, res) => {
  console.log("REQ.USER 👉", req.user);

  try {
    const result = await service.getVisibleConnections(req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success : true,
      message : result.message,
      data:result.data
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const result = await service.getUserProfile(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({ success: true, data: result.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.sendConnectionRequest = async (req, res) => {
  try {
    const fromUser = req.user.id;
    const { toUserId } = req.body;

    if (!toUserId || fromUser === toUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid request"
      });
    }

    const result = await service.sendConnectionRequest(fromUser, toUserId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Connection request sent"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



module.exports.getReceivedConnections = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user

    const result = await service.getReceivedConnections(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/**
 * RECEIVED
 */
module.exports.getReceivedConnections = async (req, res) => {
  const result = await service.getReceivedConnections(req.user.id);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};

/**
 * SENT
 */
module.exports.getSentConnections = async (req, res) => {
  const result = await service.getSentConnections(req.user.id);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
};

/**
 * ACCEPT
 */
// controller
module.exports.acceptConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const connectionId = req.params.id;

    const result = await service.acceptConnection(connectionId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: "Connection accepted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * REJECT
 */
module.exports.rejectConnection = async (req, res) => {
  const result = await service.rejectConnection(req.params.id, req.user.id);
  if (!result.success) return res.status(400).json(result);
  res.json({ success: true, message: "Connection rejected" });
};

/**
 * WITHDRAW
 */
module.exports.withdrawConnection = async (req, res) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user.id; // from_user

    const result = await service.withdrawConnection(connectionId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: "Connection withdrawn successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




/**
 * GET MY PROFILE
 */
exports.getMyProfile = async (req, res) => {
  const result = await service.getMyProfile(req.user.id);
  if (!result.success) return res.status(404).json(result);
  res.json(result);
};

/**
 * UPDATE PROFILE (TEXT DATA)
 */


  exports.updateProfile = async (req, res) => {
  try {
    console.log("REQ.USER 👉", req.user);

    const userId = req.user.id;
    const body = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id missing",
      });
    }

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty",
      });
    }

    const result = await service.updateProfile(userId, body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR 👉", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/**
 * UPDATE PHOTO
 */
exports.updatePhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No photo uploaded" });
  }

  const result = await service.updatePhoto(req.user.id, req.file);
  if (!result.success) return res.status(400).json(result);

  res.json({ success: true, message: "Photo updated" });
};

/**
 * UPDATE HOROSCOPE
 */
exports.updateHoroscope = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No horoscope uploaded" });
  }

  const result = await service.updateHoroscope(req.user.id, req.file);
  if (!result.success) return res.status(400).json(result);

  res.json({ success: true, message: "Horoscope updated" });
};

/**
 * UPDATE PRIVACY
 */
exports.updatePrivacy = async (req, res) => {
  const { privacy } = req.body;

  if (!["Public", "Private"].includes(privacy)) {
    return res.status(400).json({ success: false, message: "Invalid privacy" });
  }

  const result = await service.updatePrivacy(req.user.id, privacy);
  if (!result.success) return res.status(400).json(result);

  res.json({ success: true, message: "Privacy updated" });
};
