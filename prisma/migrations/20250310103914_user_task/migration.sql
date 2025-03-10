/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,taskId,questionId]` on the table `UserTask` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionId` to the `UserTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserTask_userId_taskId_key";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "UserTask" ADD COLUMN     "questionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserTask_userId_taskId_questionId_key" ON "UserTask"("userId", "taskId", "questionId");

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
