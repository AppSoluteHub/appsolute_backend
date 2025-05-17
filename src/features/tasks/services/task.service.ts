import { PrismaClient } from '@prisma/client';
import { UpdateTaskData } from '../../../interfaces/task.interface';

const prisma = new PrismaClient();


// export const createTaskWithQuestions = async (
//   title: string,
//    categories: string[],
//   tags: string[],
//   url: string,
//   points: number,
//   questions: { questionText: string; options: string[]; correctAnswer: string }[]
// ) => {
//   return await prisma.task.create({
//     data: {
//       title,
//       categories,
//       tags,
//       url,
//       points,
//       questions: {
//         create: questions.map(q => ({
//           questionText: q.questionText,
//           options: q.options,
//           correctAnswer: q.correctAnswer,
//         })),
//       },
//     },
//     include: {
//       questions: true,
//     },
//   });
// };



export async function createTaskWithQuestions(
  title: string,
  categories: string[],
  tags: string[],
  url: string,
  points: number,
  questions: { questionText: string; options: string[]; correctAnswer: string }[]
) {
  return prisma.task.create({
    data: {
      title,
      url,
      points,
     
      questions: {
        create: questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      },
    
      tags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
   
      categories: {
        create: categories.map((name) => ({
          category: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      questions: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });
}


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



export const getTasks = async () => {
  return await prisma.task.findMany({
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



export async function deleteTaskById(taskId: string) {
  return prisma.$transaction(async (tx) => {
    // Delete relations first to avoid foreign key issues
    await tx.taskTag.deleteMany({ where: { taskId } });
    await tx.taskCategory.deleteMany({ where: { taskId } });
    await tx.question.deleteMany({ where: { taskId } });

    // Delete the task itself
    await tx.task.delete({ where: { id: taskId } });

    return { message: "Task deleted successfully" };
  });
}


export async function updateTaskWithQuestions(
  taskId: string,
  data: UpdateTaskData
) {
  const ops: any[] = [];


  if (data.tags) {
    ops.push(
      prisma.taskTag.deleteMany({ where: { taskId } })
    );
  }


  if (data.categories) {
    ops.push(
      prisma.taskCategory.deleteMany({ where: { taskId } })
    );
  }

 
  if (data.questions) {
    ops.push(
      prisma.question.deleteMany({ where: { taskId } })
    );
  }

 
  const updatePayload: any = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.url !== undefined)   updatePayload.url = data.url;
  if (data.points !== undefined) updatePayload.points = data.points;

  if (data.questions) {
    updatePayload.questions = {
      create: data.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    };
  }
  if (data.tags) {
    updatePayload.tags = {
      create: data.tags.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { name },
            create: { name },
          },
        },
      })),
    };
  }
  if (data.categories) {
    updatePayload.categories = {
      create: data.categories.map((name) => ({
        category: {
          connectOrCreate: {
            where: { name },
            create: { name },
          },
        },
      })),
    };
  }

  ops.push(
    prisma.task.update({
      where: { id: taskId },
      data: updatePayload,
      include: {
        questions: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    })
  );


  const results = await prisma.$transaction(ops);
 
  return results[results.length - 1];
}

