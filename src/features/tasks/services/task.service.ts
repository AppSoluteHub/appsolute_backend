import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// export const createTask = async (
//   question: string,
//   options: string[],
//   correctAnswer: string,
//   url: string,
//   tags: string[],
//   points: number,
//   title: string
// ) => {
//   return await prisma.task.create({
//     data: {
//       question,
//       options,
//       correctAnswer,
//       url,
//       tags,
//       points,
//       title,
//     },
//   });
// };

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
export const getAllTasks = async () => {
  return await prisma.task.findMany();
};
export const getTaskById = async(taskI : string) =>{
  return await prisma.task.findUnique({
    where: {
      id: taskI,
    },
  });
}
export const deleteTask = async (taskId: string) => {
  return await prisma.task.delete({ where: { id: taskId } });
};

// export const updateTask = async(taskId: string, question: string, options: string[], correctAnswer: string,url: string, points:number, title: string, tags : string[]) => {
//   return await prisma.task.update({
//     where: { id: taskId },
//     data: {
//       questions: { questionText: string; options: string[]; correctAnswer: string }[],
//       correctAnswer,
//       points, 
//       title,
//       tags  ,
//       url
//     },
//   });
// }


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
