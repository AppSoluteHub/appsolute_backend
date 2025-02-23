import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const answerTask = async (userId: string, taskId: string, userAnswer: number) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

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
};
