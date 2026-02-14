
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const routes = require("./routes/index");
const path = require("path");

const app = express();

app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: ["https://new-matrimony-frontend.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log("---- INCOMING REQUEST ----");
  console.log("URL:", req.method, req.originalUrl);
  console.log("Headers:", req.headers["content-type"]);
  console.log("Body:", req.body);
  console.log("RAW HEADERS 👉", req.headers);
console.log("AUTH HEADER 👉", req.headers.authorization);

  next();
});

app.use("/api",routes)



app.get("/",(req,res)=>{
  res.send("Server is running")
})



/* IMPORTANT FOR RENDER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
