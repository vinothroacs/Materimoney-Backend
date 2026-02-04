const service = require("../services/index");

module.exports.register = async (req, res) => {
  console.log("SIGN SECRET:", process.env.JWT_SECRET);

  try {
    console.log("REQ BODY 👉", req.body);
    const response = await service.register(req.body);

    return res.status(response.code).json({
      status: response.status,
      message: response.message,
      response: response.response || null,
    });
  } catch (err) {
    console.error("Register controller error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.login = async (req, res) => {
  console.log("JWT SECRET (LOGIN):", process.env.JWT_SECRET);

  try {
    const response = await service.login(req.body);
    

    console.log("JWT SECRET (LOGIN):", process.env.JWT_SECRET);


    return res.status(response.code).json({
      status: response.status,
      message: response.message,
      response: response.response,
      roleid: response.roleid, // 👈 ADD
      // userid: response.userid,
    });
  } catch (err) {
    console.error("Login controller error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
