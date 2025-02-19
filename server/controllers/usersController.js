const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
    },
  });

  res.status(200).json(users);
});

const getUserInfo = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.userId },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      chats: { select: { id: true, name: true } },
    },
  });

  if (!user) throw new CustomError("User not found.", 404);

  res.status(200).json(user);
});

const createUser = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  if (!req.body.password) {
    throw new CustomError(400, "Password is required.");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await prisma.user.create({
    data: {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
    },
  });

  res.status(201).json({ message: "User successfully created." });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) throw new CustomError("Password is required.", 400);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new CustomError("User not found.", 404);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new CustomError("Incorrect password.", 401);

  await prisma.user.delete({ where: { id: req.user.id } });

  res.status(200).json({ message: "User successfully deleted." });
});

const getFriends = asyncHandler(async (req, res) => {
  const friends = await prisma.friendship.findMany({
    where: { OR: [{ userId1: req.params.userId }, { userId2: req.params.userId }] },
    include: {
      user1: { select: { id: true, username: true } },
      user2: { select: { id: true, username: true } },
    },
  });

  res.status(200).json(friends.map((f) => (f.userId1 === req.params.userId ? f.user2 : f.user1)));
});

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user.id;

  if (userId === requesterId) throw new CustomError("You cannot send a friend request to yourself.", 400);

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId1: requesterId, userId2: userId },
        { userId1: userId, userId2: requesterId },
      ],
    },
  });

  if (existingFriendship) throw new CustomError("Friend request already sent or friendship already exists.", 400);

  await prisma.friendRequest.create({
    data: { fromUserId: requesterId, toUserId: userId },
  });

  res.status(201).json({ message: "Friend request sent." });
});

const removeFriend = asyncHandler(async (req, res) => {
  const { userId, friendId } = req.params;

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId1: userId, userId2: friendId },
        { userId1: friendId, userId2: userId },
      ],
    },
  });

  if (!friendship) throw new CustomError("Friendship not found.", 404);

  await prisma.friendship.delete({ where: { id: friendship.id } });

  res.status(200).json({ message: "Friend removed successfully." });
});

const getFriendRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      select: {
        id: true,
        sender: { select: { id: true, username: true, firstName: true, lastName: true } },
        createdAt: true,
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to retrieve friend requests." });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    // Find the existing friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: { senderId: friendId, receiverId: userId, status: "PENDING" },
    });

    if (!existingRequest) {
      return res.status(404).json({ error: "Friend request not found." });
    }

    // Update friend request status to ACCEPTED
    await prisma.friendRequest.update({
      where: { id: existingRequest.id },
      data: { status: "ACCEPTED" },
    });

    // Add users as friends (bi-directional relationship)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { friendRequestsReceived: { disconnect: { id: existingRequest.id } } },
      }),
      prisma.user.update({
        where: { id: friendId },
        data: { friendRequestsSent: { disconnect: { id: existingRequest.id } } },
      }),
    ]);

    res.status(200).json({ message: "Friend request accepted successfully." });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Failed to accept friend request." });
  }
};

const declineFriendRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });

    if (!request) {
      return res.status(404).json({ error: "Friend request not found." });
    }

    // Only delete if it's still pending
    if (request.status === "PENDING") {
      await prisma.friendRequest.delete({ where: { id: requestId } });
    }

    res.status(200).json({ message: "Friend request declined." });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ error: "Failed to decline friend request." });
  }
};

const getChats = asyncHandler(async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: { members: { some: { userId: req.params.userId } } },
    select: { id: true, name: true, createdAt: true },
  });

  res.status(200).json(chats);
});

module.exports = {
  getAllUsers,
  getUserInfo,
  createUser,
  deleteUser,
  getFriends,
  sendFriendRequest,
  removeFriend,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getChats,
};
