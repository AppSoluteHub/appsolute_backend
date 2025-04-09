"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.deleteTask = exports.getTaskById = exports.getTasks = exports.getAllTasks = exports.createTaskWithQuestions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
const getAllTasks = async (userId) => {
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
exports.getAllTasks = getAllTasks;
const getTasks = async () => {
    return await prisma.task.findMany({
        include: { questions: true },
    });
};
exports.getTasks = getTasks;
const getTaskById = async (taskId, userId) => {
    console.log(userId);
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
};
exports.getTaskById = getTaskById;
const deleteTask = async (taskId) => {
    return await prisma.task.delete({ where: { id: taskId } });
};
exports.deleteTask = deleteTask;
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
