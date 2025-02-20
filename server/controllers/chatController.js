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
          some: { userId }, // Find chats where the user is a member
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, username: true } } }, // Fetch user details
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: { select: { username: true } }, // Include message sender's username
          },
        },
      },
    });

    // Format response to include lastMessage, sender, and timestamp
    const formattedChats = chats.map((chat) => {
      const otherMembers = chat.members
        .filter((m) => m.user.id !== userId) // Exclude logged-in user
        .map((m) => m.user.username)
        .join(", ");

      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        chatName: chat.groupName || otherMembers || "Unnamed Chat", // Use groupName if available
        lastMessage: lastMessage ? lastMessage.text : "No messages yet",
        lastMessageSender: lastMessage ? lastMessage.user.username : null, // Include sender username
        lastMessageAt: lastMessage ? lastMessage.createdAt : chat.createdAt, // Use createdAt if no messages
      };
    });

    // Sort chats by lastMessageAt (most recent first)
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
      messages: {
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
        },
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

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  await prisma.chat.delete({ where: { id: chatId } });

  res.json({ message: "Chat deleted successfully" });
});

module.exports = {
  getUserChats,
  checkExistingChat,
  createChat,
  getChat,
  updateChat,
  deleteChat,
};
