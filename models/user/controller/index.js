const service = require("../services/index");

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
