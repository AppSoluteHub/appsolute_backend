/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "correctAnswer",
DROP COLUMN "options",
DROP COLUMN "question";

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "taskId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
