/*
  Warnings:

  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'CLICK', 'LIKE', 'SHARE', 'COMMENT');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contributors" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserBehavior" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postCategory" "PostCategory" NOT NULL,
    "interaction" "InteractionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBehavior_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBehavior" ADD CONSTRAINT "UserBehavior_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
