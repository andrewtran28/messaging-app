require("dotenv").config();
const express = require("express");
const path = require("node:path");
const passport = require("passport");
const cors = require ("cors");
const cookieParser = require("cookie-parser");
const { configurePassPort } = require (".config/auth");
const authRouter = require ("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const chatRouter = require ("./routes/chatRouter");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Initialize Passport and Configure Strategy
app.use(passport.initialize());
configurePassport(passport);

//Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/chat", chatRouter);

//Error handling middleware
app.use((err, req, res, next) => {
  console.error(`ERROR: ${req.method} ${req.url}`, {
    user: req.user ? req.user.username : "Unauthenticated user",
    body: req.body,
    error: err.stack,
  });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

//Start Express server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
