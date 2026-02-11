const jwt = require("jsonwebtoken");

const db = require("../../../config/db");

module.exports.login = async (props) => {
  const { email, password } = props;

  try {
    const user = await db("users")
      .where({ email })
      .orWhere("phone", email)
      .first();

    if (!user) {
      return {
        code: 400,
        status: false,
        message: "Invalid email or password",
      };
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      return {
        code: 400,
        status: false,
        message: "Invalid email or password",
      };
    }

    const token = jwt.sign(
      {
        userid: user.id,
        name: user.name,
        email: user.email,
        roleid: user.roleid,
        status: user.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    return {
      code: 200,
      status: true,
      message: "Login successful",
      response: token,
      roleid: user.roleid,
      status: user.status,
      user: {
        id: user.id, // ✅ IMPORTANT
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Auth Service Login Error:", error);

    return {
      code: 500,
      status: false,
      message: "Authentication failed",
    };
  }
};

module.exports.register = async (props) => {
  const { name, email, password, phone } = props;

  try {
    // 🚫 Block admin registration
    if (email === "admin@gmail.com") {
      return {
        code: 403,
        status: false,
        message: "Admin registration is not allowed",
      };
    }

    const existingUser = await db("users").where({ email }).first();

    if (existingUser) {
      return {
        code: 400,
        status: false,
        message: "Email already registered",
      };
    }

    const [userid] = await db("users").insert({
      name,
      email,
      phone,
      password, //// plain password (unchanged)
      roleid: 2,
      status: "NEW",
    });

    const token = jwt.sign(
      {
        userid,
        name,
        email,
        phone,
        roleid: 2,
        status: "ACTIVE",
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    return {
      code: 201,
      status: true,
      message: "Registration successful",
      response: token,
      roleid: 2,
    };
  } catch (error) {
    console.error("Auth Service Register Error:", error);

    return {
      code: 500,
      status: false,
      message: "Registration failed",
    };
  }
};

