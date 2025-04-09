"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerTask = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const answerTask = async (userId, taskId, answers) => {
    try {
        const existingAttempt = await prisma.userTask.findFirst({
            where: { userId, taskId },
        });
        if (existingAttempt) {
            throw new appError_1.BadRequestError("You have already attempted this task.");
        }
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { questions: true },
        });
        if (!task)
            throw new appError_1.BadRequestError("Task not found.");
        const totalQuestions = task.questions.length;
        if (totalQuestions === 0)
            throw new appError_1.BadRequestError("No questions in this task.");
        let correctAnswersCount = 0;
        const userAnswers = answers.map(({ questionId, userAnswer }) => {
            const question = task.questions.find((q) => q.id === questionId);
            if (!question) {
                throw new appError_1.BadRequestError(`Question ID ${questionId} not found in this task.`);
            }
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect)
                correctAnswersCount++;
            return {
                userId,
                taskId,
                questionId,
                userAnswer,
                isCorrect,
            };
        });
        await prisma.userTask.createMany({ data: userAnswers });
        let totalScoreEarned = (task.points / totalQuestions) * correctAnswersCount;
        totalScoreEarned = Math.round(totalScoreEarned);
        if (totalScoreEarned > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { totalScore: { increment: totalScoreEarned } },
            });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { answered: { increment: answers.length } },
        });
        return { message: "Answers submitted successfully", totalScoreEarned };
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
