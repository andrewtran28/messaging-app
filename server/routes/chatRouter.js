const { Router } = require("express");
const chatRouter = Router();
const chatController = require("../controllers/chatController");
const messageController = require("../controllers/messageController");
const { authenticateToken } = require("../config/auth");

//Chats
chatRouter.get("/", authenticateToken, chatController.getUserChats);
chatRouter.post("/", authenticateToken, chatController.createChat);
chatRouter.post("/check", authenticateToken, chatController.checkExistingChat);
chatRouter.get("/:chatId", authenticateToken, chatController.getChat);
chatRouter.put("/:chatId", authenticateToken, chatController.updateChat);
chatRouter.delete("/:chatId", authenticateToken, chatController.deleteChat);


//Messages
chatRouter.post("/:chatId/messages", authenticateToken, messageController.sendMessage);
chatRouter.get("/:chatId/messages", authenticateToken, messageController.getMessages);
chatRouter.put("/:chatId/messages/:messagesId", authenticateToken, messageController.editMessage);
chatRouter.delete("/:chatId/messages/:messageId", authenticateToken, messageController.deleteMessage);
chatRouter.post("/:chatId/messages/:messageId/reactions", messageController.sendReaction);
chatRouter.post("/:chatId/messages/:messageId/read-receipt", messageController.readMessages);


module.exports = chatRouter;
