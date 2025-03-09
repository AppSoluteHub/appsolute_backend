/*
  Warnings:

  - You are about to drop the column `score` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "score",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY['YouTube']::TEXT[],
ADD COLUMN     "title" TEXT;
