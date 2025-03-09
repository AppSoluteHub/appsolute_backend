"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerTask = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const answerTask = async (userId, taskId, userAnswer) => {
    try {
        const existingAttempt = await prisma.userTask.findFirst({
            where: { userId, taskId },
        });
        if (existingAttempt) {
            throw new appError_1.BadRequestError("You have already attempted this task.");
        }
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new appError_1.BadRequestError("Task not found.");
        const isCorrect = userAnswer === task.correctAnswer;
        const scoreEarned = isCorrect ? task.points : 0;
        const userTask = await prisma.userTask.create({
            data: {
                userId,
                taskId,
                userAnswer,
                isCorrect,
                scoreEarned,
            },
        });
        if (isCorrect) {
            await prisma.user.update({
                where: { id: userId },
                data: { totalScore: { increment: scoreEarned } },
            });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { answered: { increment: 1 } },
        });
        return userTask;
    }
    catch (error) {
        console.error("Error in answerTask:", error);
        if (error instanceof appError_1.BadRequestError) {
            throw error;
        }
        if (error.code) {
            throw new appError_1.BadRequestError(`Database error: ${error.message}`);
        }
        throw new appError_1.InternalServerError("Unable to answer task.");
    }
};
exports.answerTask = answerTask;
