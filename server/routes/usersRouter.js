const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator } = require("../utils/validator");
const { authenticateToken } = require("../config/auth");

//User Routing
// usersRouter.post("/", signupValidator, usersController.createUser);
usersRouter.post("/", usersController.createUser);
usersRouter.get("/:userId", authenticateToken, usersController.getUserInfo);
usersRouter.delete("/userId", authenticateToken, usersController.deleteUser);

usersRouter.get(":userId/friends", authenticateToken, usersController.getFriends);
usersRouter.post(":userId/friends", authenticateToken, usersController.sendFriendRequest);
usersRouter.delete(":userId/friends/friendId", authenticateToken, usersController.removeFriend);

usersRouter.get(":userId/chats", authenticateToken, usersController.getChats);

module.exports = usersRouter;