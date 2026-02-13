//new changes

const service = require("../services/index");

module.exports.submitProfile = async (req, res) => {
  console.log("SUBMIT BODY 👉", req.body);
  console.log("USER FROM TOKEN 👉", req.user);


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
  try {
    const result = await service.getVisibleConnections(req.user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports.sendConnectionRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { profileId } = req.body;

    console.log(req.user.id, req.body);

    if (!fromUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "profileId is required",
      });
    }

    const result = await service.sendConnectionRequest(fromUserId, profileId);

    if (!result.success) {
      return res.status(400).json(result);
    }

  return res.status(200).json({
  success: true,
  message: "Connection request sent",
  fromUser: result.fromUser,
  toUser: result.toUser,
});

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// My connection

module.exports.getReceivedConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("user test", req.user);

    const data = await service.getReceivedConnections(userId);
    console.log("data");

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/// GET SENTCONNECTION
module.exports.getSentConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await service.getSentConnections(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//// GET ACEPET CONNECCTIONS

// ACCEPT CONNECTION (update DB)
module.exports.acceptConnection = async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    const userId = req.user.id;

    const result = await service.acceptConnection(connectionId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ACCEPTED CONNECTIONS (24 hrs valid)
module.exports.getAcceptedConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await service.getAcceptedConnections(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

///REJECT CONNECTIONS

module.exports.rejectConnection = async (req, res) => {
  try {
    const connectionId = Number(req.params.id);
    const userId = req.user.id; // from JWT

    const result = await service.rejectConnection(connectionId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Reject connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * WITHDRAW
 */
module.exports.withdrawConnection = async (req, res) => {
  try {
    const connectionId = req.params.connectionId;
    const userId = req.user.id;

    const result = await service.withdrawConnection(connectionId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ////  Update Profile
module.exports.updateUserProfile = async (req, res) => {
  try {
    const response = await service.updateUserProfile({
      userid: req.user.id,
      ...req.body,
    });

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/**
 * UPDATE PROFILE (TEXT DATA)
 */



/**
 * UPDATE PHOTO
 */
exports.updatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No photo uploaded",
      });
    }

    const result = await service.uploadProfilePhoto({
      userId: req.user.id,
      file: req.file,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// horosccope
module.exports.uploadHoroscope = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Horoscope file is required",
      });
    }

    const response = await service.uploadHoroscope({
      userId,
      file,
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      
      success: false,
     
      
    });
    
  }
};      


/// get user profile

module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await service.getUserProfile(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    // controller-level error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



// //User Reject conn

// module.exports.rejectConnection = async (req, res) => {
//   try {
// const  userId  = req.user.id
//     const { id: connectionId } = req.params;

//     // if (!connectionId) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "Invalid request"
//     //   });
//     // }

//     const result = await service.rejectConnection(connectionId, userId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     res.json({
//       success: true,
//       message: "Connection rejected"
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


// /**
//  * RECEIVED
//  */
// module.exports.getReceivedConnections = async (req, res) => {
//   const result = await service.getReceivedConnections(req.user.id);
//   console.log(result);
  
//   if (!result.success) return res.status(400).json(result);
//   res.json(result);
// };//

/**
 * SENT
 */
// module.exports.getSentConnections = async (req, res) => {
//   try {
//     const result = await service.getSentConnections(req.user.id);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.json(result);

//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


/**
 * ACCEPT
 */
// controller
// module.exports.acceptConnection = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const connectionId = req.params.id;

//     const result = await service.acceptConnection(connectionId, userId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     res.json({ success: true, message: "Connection accepted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// /**
//  * REJECT
//  */
// module.exports.rejectConnection = async (req, res) => {
//   const result = await service.rejectConnection(req.params.id, req.user.id);
//   if (!result.success) return res.status(400).json(result);
//   res.json({ success: true, message: "Connection rejected" });
// };
