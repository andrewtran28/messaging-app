require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("node:path");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { configurePassport } = require("./config/auth");
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const chatRouter = require("./routes/chatRouter");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const groupChats = new Map();
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", (chatId) => {
    if (!groupChats.has(chatId)) groupChats.set(chatId, new Set());
    groupChats.get(chatId).add(socket.id);
  });

  // Send message to group chat (broadcast to all members of the group)
  socket.on("sendMessage", (messageData) => {
    const { chatId } = messageData;
    const groupSockets = groupChats.get(chatId);

    if (groupSockets) {
      groupSockets.forEach((socketId) => {
        io.to(socketId).emit("receiveMessage", messageData);
      });
    }
  });

  // Disconnect and remove the user from the group chat
  socket.on("disconnect", () => {
    for (let [chatId, sockets] of groupChats.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) groupChats.delete(chatId);
        break;
      }
    }
  });
});

app.use(cors({ origin: process.env.FRONTEND_URL, methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Initialize Passport and Configure Strategy
app.use(passport.initialize());
configurePassport(passport);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/chat", chatRouter);

// Error handling middleware
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

// Start server
const PORT = process.env.PORT || 1997;
server.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
