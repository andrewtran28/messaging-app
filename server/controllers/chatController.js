const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const prisma = new PrismaClient();

const getUserChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const chats = await prisma.chat.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, profileIcon: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          user: { select: { username: true } },
          readReceipts: { select: { userId: true } },
        },
      },
    },
  });

  const formattedChats = chats
    .map(({ id, isGroup, groupName, members, messages, createdAt }) => ({
      id,
      isGroup,
      chatName:
        groupName ||
        members
          .filter((m) => m.user.id !== userId)
          .map((m) => m.user.username)
          .join(", "),
      members: members.map(({ user: { id, username, profileIcon } }) => ({ id, username, profileIcon })),
      lastMessage: messages[0]?.text || "No messages yet",
      lastMessageSender: messages[0]?.user.username || null,
      lastMessageAt: messages[0]?.createdAt || createdAt,
      lastMessageReadBy: messages[0]?.readReceipts.map(({ userId }) => userId) || [],
    }))
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

  res.json(formattedChats);
});

const checkExistingChat = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recipientId } = req.body;

  if (!recipientId) throw new CustomError(400, "Recipient ID is required");
  if (userId === recipientId) throw new CustomError(400, "You cannot start a chat with yourself.");

  const chat = await prisma.chat.findFirst({
    where: {
      members: { every: { userId: { in: [userId, recipientId] } } },
    },
    select: { id: true, members: true },
  });

  res.status(200).json({ chatId: chat?.id || null });
});

const createChat = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { userIds, groupName } = req.body;

  const chat = await prisma.chat.create({
    data: {
      groupName,
      isGroup: userIds.length >= 3,
      members: { create: userIds.map((userId) => ({ userId })) },
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
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileIcon: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" }, // Order members by joinedAt
      },
      messages: {
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
          readReceipts: { include: { user: { select: { id: true, username: true } } } },
        },
        orderBy: { createdAt: "asc" }, // Kept ordering messages by createdAt
      },
    },
  });

  if (!chat) throw new CustomError(404, "Chat not found");

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

const addMembers = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userIds } = req.body;

  if (!userIds?.length) {
    return res.status(400).json({ message: "No users provided to add." });
  }

  await prisma.chatMember.createMany({
    data: userIds.map((userId) => ({ chatId, userId })),
    skipDuplicates: true,
  });

  const updatedMembers = await prisma.chatMember.findMany({
    where: { chatId },
    include: { user: true },
  });

  res.status(200).json({ message: "Users added successfully.", members: updatedMembers });
});

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { members: true },
  });

  if (!chat) return res.status(404).json({ message: "Chat not found." });
  if (!chat.isGroup) return res.status(400).json({ message: "Cannot leave a direct message chat." });

  const isMember = chat.members.some((member) => member.userId === userId);
  if (!isMember) return res.status(403).json({ message: "You are not in this chat." });

  if (chat.members.length === 1) {
    await prisma.chat.delete({ where: { id: chatId } });
    return res.json({ message: "Chat deleted successfully." });
  }

  await prisma.chatMember.deleteMany({ where: { chatId, userId } });

  res.json({ message: "You have left the chat." });
});

module.exports = {
  getUserChats,
  checkExistingChat,
  createChat,
  getChat,
  updateChat,
  addMembers,
  leaveGroupChat,
};
