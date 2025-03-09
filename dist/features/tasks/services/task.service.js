"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.deleteTask = exports.getTaskById = exports.getAllTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTask = async (question, options, correctAnswer, url, tags, points, title) => {
    return await prisma.task.create({
        data: {
            question,
            options,
            correctAnswer,
            url,
            tags,
            points,
            title
        },
    });
};
exports.createTask = createTask;
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
const updateTask = async (taskId, question, options, correctAnswer, points, title, tags) => {
    return await prisma.task.update({
        where: { id: taskId },
        data: {
            question,
            options,
            correctAnswer,
            points,
            title,
            tags
        },
    });
};
exports.updateTask = updateTask;
