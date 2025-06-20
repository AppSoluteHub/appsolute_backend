import { PrismaClient } from '@prisma/client';
import { UpdateTaskData } from '../../../interfaces/task.interface';

const prisma = new PrismaClient();
export async function createTaskWithQuestions(
  title: string,
  categories: string[],
  tags: string[],
  url: string,
  points: number,
  imageUrl: string,
  description: string,
  questions: { questionText: string; options: string[]; correctAnswer: string }[]
) {
  try {
    return await prisma.task.create({
      data: {
        title,
        url,
        points,
        imageUrl,
        description,
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
  } catch (error) {
    console.error("Error creating task with questions:", error);
    throw error; 
  }
}


export const getAllTasks = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userTasks: true,
      },
    });

    if (!user) {
      throw new Error("User with this id not found");
    }

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
      include: {
        questions: true,
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    throw new Error(`${error}`);
  }
};


export const getTasks = async () => {
  return await prisma.task.findMany({
    include: {
      questions: true,
      tags: {
        include: {
          tag: {
            select: {
                id: true,
              name: true,
            },
          },
        },
      },
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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

export const getUserTaskProgressService = async (userId: string) => {
  const totalTasks = await prisma.task.count();

  const completedTasks = await prisma.userTask.count({
    where: { userId },
  });

  return {
    completedTasks,
    totalTasks,
    progressPercent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
  };
};


export const getLeaderboardProgressService = async (userId: string) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalScore: true },
  });

  if (!currentUser) throw new Error("User not found");

  const userScore = currentUser.totalScore;

  const usersAhead = await prisma.user.findMany({
    where: {
      totalScore: {
        gt: userScore,
      },
    },
    orderBy: {
      totalScore: 'asc',
    },
    select: {
      totalScore: true,
    },
  });

  const aheadCount = usersAhead.length;

  if (aheadCount === 0) {
    return {
      message: "You're currently ahead of everyone 🎉",
      peopleToBypass: 0,
      pointsToBypass: 0,
    };
  }

  const percentToBypass = 0.2;
  const peopleToBypass = Math.max(1, Math.floor(aheadCount * percentToBypass));
  const targetUser = usersAhead[peopleToBypass - 1];

  const pointsToBypass = targetUser.totalScore - userScore;
    const personLabel = peopleToBypass === 1 ? "person" : "people";
  return {
    message: `Earn ${pointsToBypass} more points to bypass ${peopleToBypass} ${personLabel}`,
    peopleToBypass,
    pointsToBypass,
  };
};

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
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
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

