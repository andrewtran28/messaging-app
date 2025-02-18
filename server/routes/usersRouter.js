const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator } = require("../utils/validator");
const { authenticateToken } = require("../utils/auth");

//User Routing
usersRouter.post("/register", signupValidator, usersController.createUser);
usersRouter.get("/:userId", authenticateToken, usersController.getUserInfo);
usersRouter.delete("/userId", authenticateToken, usersController.deleteUser);

usersRouter.get(":userId/friends", authenticateToken, usersControlelr.getFriends);
usersRouter.post(":userId/friends", authenticateToken, usersController.sendFriendRequest);
usersRouter.delete(":userId/friends/friendId", authenticateToken, userserController.removeFriend);

usersRouter.get(":userId/chats".authenticateToken, usersController.getChats);

module.exports = usersRouter;