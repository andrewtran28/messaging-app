const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const prisma = new PrismaClient();

const checkExistingChat = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Authenticated user
  const { recipientId } = req.body; // The user they want to chat with
  if (!recipientId) throw new CustomError(400, "Recipient ID is required");

  if (userId === recipientId) throw new CustomError(400, "You cannot start a chat with yourself.");

  const chat = await prisma.chat.findFirst({
    where: {
      members: {
        every: { userId: { in: [userId, recipientId] } },
        some: { userId: userId },
        some: { userId: recipientId },
      },
    },
    include: {
      members: true,
    },
  });

  if (!chat || chat.members.length !== 2) {
    return res.status(200).json({ chatId: null });
  }

  console.log("Chat does exist.");
  res.status(200).json({ chatId: chat.id });
});

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
        create: userIds.map((userId) => ({ userId })),
      },
    },
    include: { members: true },
  });

  res.status(201).json(chat);
});

const getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
      messages: true,
    },
  });

  if (!chat) {
    throw new CustomError(404, "Chat not found");
  }

  // Transform response to simplify frontend
  const formattedChat = {
    id: chat.id,
    members: chat.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
    })),
    messages: chat.messages,
  };

  res.json(formattedChat);
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
  checkExistingChat,
  createChat,
  getChat,
  updateChat,
  deleteChat,
};
