const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator } = require("../utils/validator");
const { authToken } = require("../config/auth");

//User Routing
usersRouter.get("/", usersController.getAllUsers);
usersRouter.post("/", signupValidator, usersController.createUser);
usersRouter.get("/:userId", authToken, usersController.getUserInfo);
usersRouter.delete("/:userId", authToken, usersController.deleteUser);

//Friends & Friend Requests
/*
usersRouter.get("/:userId/friends", authToken, usersController.getFriends);
usersRouter.post("/:userId/friends", authToken, usersController.sendFriendRequest);
usersRouter.delete("/:userId/friends/:friendId", authToken, usersController.removeFriend);

usersRouter.get("/:userId/friends/requests", authToken, usersController.getFriendRequests);
usersRouter.patch("/:userId/friends/:friendId", authToken, usersController.acceptFriendRequest);
usersRouter.delete("/:userId/friend/requests/:requestId", authToken, usersController.declineFriendRequest);
*/

//Chats
usersRouter.get("/:userId/chats", authToken, usersController.getChats);

module.exports = usersRouter;