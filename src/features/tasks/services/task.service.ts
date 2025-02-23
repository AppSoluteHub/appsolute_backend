import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (question: string, options: string[], correctAnswer: string) => {
  return await prisma.task.create({
    data: {
      question,
      options,
      correctAnswer,
    },
  });
};

export const getAllTasks = async () => {
  return await prisma.task.findMany();
};
