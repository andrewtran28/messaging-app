const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const prisma = new PrismaClient();

const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, username: true } } },
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

    // Format response
    const formattedChats = chats.map((chat) => {
      const otherMembers = chat.members
        .filter((m) => m.user.id !== userId)
        .map((m) => m.user.username)
        .join(", ");

      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        chatName: chat.groupName || otherMembers,
        lastMessage: lastMessage ? lastMessage.text : "No messages yet",
        lastMessageSender: lastMessage ? lastMessage.user.username : null,
        lastMessageAt: lastMessage ? lastMessage.createdAt : chat.createdAt,
        lastMessageReadBy: lastMessage ? lastMessage.readReceipts.map((receipt) => receipt.userId) : [],
      };
    });

    // Sort chats by latest message timestamp
    formattedChats.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json(formattedChats);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: "Failed to fetch chats." });
  }
};

const checkExistingChat = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Authenticated user
  const { recipientId } = req.body; // The user they want to chat with

  if (!recipientId) throw new CustomError(400, "Recipient ID is required");

  if (userId === recipientId) throw new CustomError(400, "You cannot start a chat with yourself.");

  const chat = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: recipientId } } },
        { members: { every: { userId: { in: [userId, recipientId] } } } },
      ],
    },
    include: {
      members: true,
    },
  });

  if (!chat || chat.members.length !== 2) {
    return res.status(200).json({ chatId: null });
  }

  res.status(200).json({ chatId: chat.id });
});

const createChat = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const { userIds, groupName } = req.body;

  const chat = await prisma.chat.create({
    data: {
      groupName,
      isGroup: userIds.length >= 3, //Set isGroup to true if members are 3+
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
      members: { include: { user: { select: { id: true, username: true } } } },
      messages: {
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
          readReceipts: { include: { user: { select: { id: true, username: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
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

const addMembers = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { userIds } = req.body;

  if (!userIds || userIds.length === 0) {
    return res.status(400).json({ message: "No users provided to add." });
  }

  await prisma.chatMember.createMany({
    data: userIds.map((userId) => ({
      chatId,
      userId,
    })),
    skipDuplicates: true,
  });

  // Fetch the updated list of chat members
  const updatedMembers = await prisma.chatMember.findMany({
    where: { chatId },
    include: { user: true }, // Fetch user details if needed
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

  await prisma.chatMember.deleteMany({
    where: { chatId, userId },
  });
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
