import { prisma } from '../../utils/prisma';

export const fetchForDisplay = async (number: number) => {
  return prisma.quizQuestion.findUnique({
    where: { number },
    select: {
      id: true,
      number: true,
      question: true,
      used: true,
    },
  });
};

// Atomically mark question as used
const markUsedAtomic = async (number: number) => {
  const update = await prisma.quizQuestion.updateMany({
    where: { number, used: false },
    data: { used: true },
  });

  const question = await prisma.quizQuestion.findUnique({
    where: { number },
  });

  return { marked: update.count > 0, question };
};

export const attemptQuestion = async (
  number: number,
  userAnswer: string,
  userId: string
) => {
  const { marked, question } = await markUsedAtomic(number);

  if (!question) {
    return { success: false, error: 'Question not found' };
  }

  if (!marked) {
    return { success: false, error: 'Too late: question already answered' };
  }

  const correct =
    String(userAnswer).trim().toLowerCase() ===
    String(question.answer).trim().toLowerCase();

  let scoreRecord = await prisma.score.findUnique({
    where: { userId },
  });

  if (!scoreRecord) {
    scoreRecord = await prisma.score.create({
      data: {
        userId,
        score: correct ? 1 : 0,
      },
    });
  } else if (correct) {
    scoreRecord = await prisma.score.update({
      where: { userId },
      data: { score: scoreRecord.score + 1 },
    });
  }

  return {
    success: true,
    correct,
    correctAnswer: question.answer,
    userScore: scoreRecord.score,
  };
};
