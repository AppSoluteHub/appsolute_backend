/*
  Warnings:

  - You are about to drop the column `contentId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_contentId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "contentId";
