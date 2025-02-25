/*
  Warnings:

  - You are about to alter the column `groupName` on the `chats` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - You are about to alter the column `text` on the `messages` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `firstName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - You are about to alter the column `lastName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE "chats" ALTER COLUMN "groupName" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "text" SET DATA TYPE VARCHAR(2048);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileIcon" VARCHAR(100) NOT NULL DEFAULT '/profile/default.png',
ALTER COLUMN "username" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(30);
