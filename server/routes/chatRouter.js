const { Router } = require("express");
const chatRouter = Router();
const chatController = require("../controllers/chatController");
const messageController = require("../controllers/messageController");
const { authToken } = require("../config/auth");

//Chats
chatRouter.get("/", authToken, chatController.getUserChats);
chatRouter.post("/", authToken, chatController.createChat);
chatRouter.post("/check", authToken, chatController.checkExistingChat);
chatRouter.get("/:chatId", authToken, chatController.getChat);
chatRouter.put("/:chatId", authToken, chatController.updateChat);
chatRouter.post("/:chatId/add-members", authToken, chatController.addMembers);
chatRouter.delete("/:chatId", authToken, chatController.leaveGroupChat);

//Messages
chatRouter.post("/:chatId/messages", authToken, messageController.sendMessage);
chatRouter.get("/:chatId/messages", authToken, messageController.getMessages);
// chatRouter.put("/:chatId/messages/:messagesId", authToken, messageController.editMessage);
// chatRouter.delete("/:chatId/messages/:messageId", authToken, messageController.deleteMessage);
// chatRouter.post("/:chatId/messages/:messageId/reactions", messageController.sendReaction);
chatRouter.post("/:chatId/messages/:messageId/read-receipt", authToken, messageController.readMessages);

module.exports = chatRouter;
