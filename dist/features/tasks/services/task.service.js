"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.deleteTask = exports.getAllTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTask = async (question, options, correctAnswer, url) => {
    return await prisma.task.create({
        data: {
            question,
            options,
            correctAnswer,
            url,
        },
    });
};
exports.createTask = createTask;
const getAllTasks = async () => {
    return await prisma.task.findMany();
};
exports.getAllTasks = getAllTasks;
const deleteTask = async (taskId) => {
    return await prisma.task.delete({ where: { id: taskId } });
};
exports.deleteTask = deleteTask;
const updateTask = async (taskId, question, options, correctAnswer) => {
    return await prisma.task.update({
        where: { id: taskId },
        data: {
            question,
            options,
            correctAnswer,
        },
    });
};
exports.updateTask = updateTask;
