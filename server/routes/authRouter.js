const { Router } = require("express");
const authRouter = Router();
const authController = require("../controllers/authController");
const { authToken } = require("../config/auth");

authRouter.get("/", authToken, authController.getCurrentUser);
authRouter.post("/", authController.logInUser);
authRouter.delete("/", authToken, authController.logOutUser);

module.exports = authRouter;
