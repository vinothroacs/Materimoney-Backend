const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ✅ STATIC FILES */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ✅ CORS (🔥 VERY IMPORTANT) */
app.use(
  cors(
  
    
  )
);

/* 🔥 MUST ADD THIS LINE */


/* ✅ ROUTES */
app.use("/api/v1/auth", require("./models/auth/routes/authRoutes"));
app.use("/api/v1/user", require("./models/user/routes/userRoutes"));
app.use("/api/v1/admin", require("./models/admin/routes/adminRoutes"));

app.get("/", (req, res) => {
  res.send("API running...");
});

module.exports = app;