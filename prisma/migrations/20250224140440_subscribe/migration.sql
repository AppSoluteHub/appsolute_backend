/*
  Warnings:

  - You are about to drop the column `followerId` on the `Subscriber` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subscriber` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Subscriber` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Subscriber` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subscriber" DROP CONSTRAINT "Subscriber_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Subscriber" DROP CONSTRAINT "Subscriber_userId_fkey";

-- DropIndex
DROP INDEX "Subscriber_userId_followerId_key";

-- AlterTable
ALTER TABLE "Subscriber" DROP COLUMN "followerId",
DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
