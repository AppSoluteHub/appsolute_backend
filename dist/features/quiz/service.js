"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attemptQuestion = exports.fetchForDisplay = void 0;
const prisma_1 = require("../../utils/prisma");
const fetchForDisplay = async (number) => {
    return prisma_1.prisma.quizQuestion.findUnique({
        where: { number },
        select: {
            id: true,
            number: true,
            question: true,
            used: true,
        },
    });
};
exports.fetchForDisplay = fetchForDisplay;
// Atomically mark question as used
const markUsedAtomic = async (number) => {
    const update = await prisma_1.prisma.quizQuestion.updateMany({
        where: { number, used: false },
        data: { used: true },
    });
    const question = await prisma_1.prisma.quizQuestion.findUnique({
        where: { number },
    });
    return { marked: update.count > 0, question };
};
const attemptQuestion = async (number, userAnswer, userId) => {
    const { marked, question } = await markUsedAtomic(number);
    if (!question) {
        return { success: false, error: 'Question not found' };
    }
    if (!marked) {
        return { success: false, error: 'Too late: question already answered' };
    }
    const correct = String(userAnswer).trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase();
    let scoreRecord = await prisma_1.prisma.score.findUnique({
        where: { userId },
    });
    if (!scoreRecord) {
        scoreRecord = await prisma_1.prisma.score.create({
            data: {
                userId,
                score: correct ? 1 : 0,
            },
        });
    }
    else if (correct) {
        scoreRecord = await prisma_1.prisma.score.update({
            where: { userId },
            data: { score: scoreRecord.score + 1 },
        });
    }
    return {
        success: true,
        correct,
        correctAnswer: question.answer,
        userScore: scoreRecord.score,
    };
};
exports.attemptQuestion = attemptQuestion;
