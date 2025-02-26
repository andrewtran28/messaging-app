/*
  Warnings:

  - You are about to drop the `friendrequests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messagereactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "friendrequests" DROP CONSTRAINT "friendrequests_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "friendrequests" DROP CONSTRAINT "friendrequests_senderId_fkey";

-- DropForeignKey
ALTER TABLE "messagereactions" DROP CONSTRAINT "messagereactions_messageId_fkey";

-- DropForeignKey
ALTER TABLE "messagereactions" DROP CONSTRAINT "messagereactions_userId_fkey";

-- DropTable
DROP TABLE "friendrequests";

-- DropTable
DROP TABLE "messagereactions";

-- DropEnum
DROP TYPE "FriendRequestStatus";
