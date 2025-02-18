const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../utils/auth");
const CustomError = require("../utils/customError");

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "A user must be logged in to perform this action.");
  }

  // Return the current user's details (excluding sensitive data such as password)
  const { password, ...userData } = req.user;

  res.status(200).json({
    success: true,
    user: userData,
  });
});

const logInUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  if (!user) {
    console.error(`Login failed: User does not exist (${username})`);
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.error(`Login failed: Incorrect password for user (${username})`);
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = generateToken(user);
  const { password: _, ...userData } = user;

  res.status(200).json({ message: "Login successful.", token });
});

const logOutUser = asyncHandler(async (req, res) => {
  if (!req.cookies.token) {
    throw new CustomError(400, "No active session was found.");
  }

  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful." });
});

module.exports = {
  getCurrentUser,
  logInUser,
  logOutUser,
};
