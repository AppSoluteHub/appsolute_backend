"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.deleteTask = exports.getTaskById = exports.getAllTasks = exports.createTaskWithQuestions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
const createTaskWithQuestions = async (title, tags, url, points, questions) => {
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
exports.createTaskWithQuestions = createTaskWithQuestions;
const getAllTasks = async () => {
    return await prisma.task.findMany();
};
exports.getAllTasks = getAllTasks;
const getTaskById = async (taskI) => {
    return await prisma.task.findUnique({
        where: {
            id: taskI,
        },
    });
};
exports.getTaskById = getTaskById;
const deleteTask = async (taskId) => {
    return await prisma.task.delete({ where: { id: taskId } });
};
exports.deleteTask = deleteTask;
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
const updateTask = async (taskId, title, tags, url, points, questions) => {
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
exports.updateTask = updateTask;
