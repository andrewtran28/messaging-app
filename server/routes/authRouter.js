const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../config/auth");

authRouter.get("/", authenticateToken, authController.getCurrentUser);
authRouter.post("/", authController.logInUser);
authRouter.delete("/", authenticateToken, authController.logOutUser);

module.exports = authRouter;
