import { BadRequestError, InternalServerError } from "../../../lib/appError";
import { prisma } from "../../../utils/prisma";

export const answerTask = async (
  userId: string,
  taskId: string,
  answers: { questionId: number; userAnswer: string }[]
) => {
  try {
    const existingAttempt = await prisma.userTask.findFirst({
      where: { userId, taskId },
    });

    if (existingAttempt) {
      throw new BadRequestError("You have already attempted this task.");
    }


    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { questions: true },
    });

    if (!task) throw new BadRequestError("Task not found.");

    const totalQuestions = task.questions.length;
    if (totalQuestions === 0) throw new BadRequestError("No questions in this task.");

    let correctAnswersCount = 0;

    const userAnswers = answers.map(({ questionId, userAnswer }) => {
      const question = task.questions.find((q) => q.id === questionId);

      if (!question) {
        throw new BadRequestError(`Question ID ${questionId} not found in this task.`);
      }

      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswersCount++;

      // Calculate score earned for this question
      const scoreEarned = isCorrect ? Math.round(task.points / totalQuestions) : 0;

      return {
        userId,
        taskId,
        questionId,
        userAnswer,
        isCorrect,
        scoreEarned, 
      };
    });

    await prisma.userTask.createMany({ data: userAnswers });

    let totalScoreEarned = (task.points / totalQuestions) * correctAnswersCount;
    totalScoreEarned = Math.round(totalScoreEarned);

    if (totalScoreEarned > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalScore: { increment: totalScoreEarned } },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { answered: { increment: answers.length } },
    });

    return { message: "Answers submitted successfully", totalScoreEarned };
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
