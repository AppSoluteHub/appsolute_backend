/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `questionId` on the `UserTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_questionId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserTask" DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserTask_userId_taskId_questionId_key" ON "UserTask"("userId", "taskId", "questionId");

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
