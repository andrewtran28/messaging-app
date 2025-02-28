const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userId, text } = req.body;

  if (!text) throw new CustomError(400, "Message content is required.");

  const message = await prisma.message.create({
    data: { chatId, userId, text },
    include: {
      user: { select: { id: true, username: true } }, // Include user data
    },
  });

  res.status(201).json({ message });
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await prisma.message.findMany({
    where: { chatId },
    include: { user: true, reactions: true, readReceipts: true },
  });

  res.json(messages);
});

const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  if (!text) throw new CustomError(400, "Message text cannot be empty");

  const message = await prisma.message.update({
    where: { id: messageId },
    data: { text, updatedAt: new Date() },
  });

  res.json(message);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new CustomError(404, "Message not found");

  await prisma.message.delete({ where: { id: messageId } });

  res.json({ message: "Message deleted successfully" });
});

const readMessages = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;
  const readReceipt = await prisma.readReceipt.upsert({
    where: { messageId_userId: { messageId, userId } },
    update: { readAt: new Date() },
    create: { messageId, userId, readAt: new Date() },
  });

  res.status(201).json(readReceipt);
});

module.exports = {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  readMessages,
};
