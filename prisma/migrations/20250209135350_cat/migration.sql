/*
  Warnings:

  - The values [AI,MARKETING] on the enum `PostCategory` will be removed. If these variants are still used in the database, this will fail.
  - The `category` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contributors` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,followerId]` on the table `Subscriber` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostCategory_new" AS ENUM ('TECHNOLOGY', 'EDUCATION', 'LIFESTYLE', 'ENTERTAINMENT', 'SOFTWARE', 'RESEARCH', 'DESIGN');
ALTER TABLE "Post" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "UserBehavior" ALTER COLUMN "postCategory" TYPE "PostCategory_new" USING ("postCategory"::text::"PostCategory_new");
ALTER TYPE "PostCategory" RENAME TO "PostCategory_old";
ALTER TYPE "PostCategory_new" RENAME TO "PostCategory";
DROP TYPE "PostCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "editorRole" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT[],
DROP COLUMN "contributors",
ADD COLUMN     "contributors" TEXT[];

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_postId_userId_key" ON "Contributor"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_userId_followerId_key" ON "Subscriber"("userId", "followerId");

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
