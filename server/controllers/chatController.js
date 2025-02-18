const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const prisma = new PrismaClient();

const createChat = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { userIds, groupName } = req.body;

  if (!userIds || userIds.length < 2) {
    throw new CustomError(400, "At least two users are required to create a chat.");
  }

  const chat = await prisma.chat.create({
    data: {
      groupName,
      members: {
        create: userIds.map(userId => ({ userId }))
      }
    },
    include: { members: true }
  });

  res.status(201).json(chat);
});

const getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { members: true, messages: true }
  });

  if (!chat) {
    throw new CustomError(404, "Chat not found");
  }

  res.json(chat);
});

const updateChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { groupName } = req.body;

  const chat = await prisma.chat.update({
    where: { id: chatId },
    data: { groupName },
  });

  res.json(chat);
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  await prisma.chat.delete({ where: { id: chatId } });

  res.json({ message: "Chat deleted successfully" });
});

module.exports = {
  createChat,
  getChat,
  updateChat,
  deleteChat,
};
