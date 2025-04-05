import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createTaskWithQuestions = async (
  title: string,
  tags: string[],
  url: string,
  points: number,
  questions: { questionText: string; options: string[]; correctAnswer: string }[]
) => {
  return await prisma.task.create({
    data: {
      title,
      tags,
      url,
      points,
      questions: {
        create: questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      },
    },
    include: {
      questions: true,
    },
  });
};



export const getAllTasks = async (userId: string) => {
  return await prisma.task.findMany({
    where: {
      NOT: {
        userTasks: {
          some: {
            userId: userId,
          },
        },
      },
    },
    include: { questions: true },
  });
};

export const getTaskById = async (taskId: string, userId: string) => {
  console.log(userId)
  return await prisma.task.findFirst({
    where: {
      id: taskId,
      NOT: {
        userTasks: {
          some: {
            userId: userId,
          },
        },
      },
    },
    include: { questions: true }, 
  });
}


export const deleteTask = async (taskId: string) => {
  return await prisma.task.delete({ where: { id: taskId } });
};



export const updateTask = async (
  taskId: string,
  title: string,
  tags: string[],
  url: string,
  points: number,
  questions: { id: number; questionText: string; options: string[]; correctAnswer: string }[]
) => {
  return await prisma.$transaction(async (prisma) => {
   
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        tags,
        url,
        points,
      },
    });

   
    for (const question of questions) {
      await prisma.question.update({
        where: { id: question.id },
        data: {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
        },
      });
    }

    return updatedTask;
  });
};
