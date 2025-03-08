import { PrismaClient } from "@prisma/client";
import { BadRequestError, InternalServerError } from "../../../lib/appError";

const prisma = new PrismaClient();

export const answerTask = async (
  userId: string,
  taskId: string,
  userAnswer: string
) => {
  try {
  
    const existingAttempt = await prisma.userTask.findFirst({
      where: { userId, taskId },
    });

    if (existingAttempt) {
      throw new BadRequestError("You have already attempted this task.");
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new BadRequestError("Task not found.");

    const isCorrect = userAnswer === task.correctAnswer;
    const scoreEarned = isCorrect ? task.score : 0;

   
    const userTask = await prisma.userTask.create({
      data: {
        userId,
        taskId,
        userAnswer,
        isCorrect,
        scoreEarned,
      },
    });

 
    if (isCorrect) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalScore: { increment: scoreEarned } },
      });
    }

    return userTask;
  } catch (error: any) {
    console.error("Error in answerTask:", error);

   
    if (error instanceof BadRequestError) {
      throw error;
    }

   
    if (error.code) {
      throw new BadRequestError(`Database error: ${error.message}`);
    }

    throw new InternalServerError("Unable to answer task.");
  }
};
