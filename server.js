const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/dp");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./models/auth/routes/authRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
