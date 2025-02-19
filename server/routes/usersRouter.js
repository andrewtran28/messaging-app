const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator } = require("../utils/validator");
const { authenticateToken } = require("../config/auth");

//User Routing
usersRouter.get("/", usersController.getAllUsers);
usersRouter.post("/", signupValidator, usersController.createUser);
usersRouter.get("/:userId", authenticateToken, usersController.getUserInfo);
usersRouter.delete("/:userId", authenticateToken, usersController.deleteUser);

//Friends & Friend Requests
usersRouter.get("/:userId/friends", authenticateToken, usersController.getFriends);
usersRouter.post("/:userId/friends", authenticateToken, usersController.sendFriendRequest);
usersRouter.delete("/:userId/friends/:friendId", authenticateToken, usersController.removeFriend);

usersRouter.get("/:userId/friends/requests", authenticateToken, usersController.getFriendRequests);
usersRouter.patch("/:userId/friends/:friendId", authenticateToken, usersController.acceptFriendRequest);
usersRouter.delete("/:userId/friend/requests/:requestId", authenticateToken, usersController.declineFriendRequest);

//Chats
usersRouter.get("/:userId/chats", authenticateToken, usersController.getChats);

module.exports = usersRouter;