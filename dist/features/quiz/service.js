"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSpinConfig = exports.attemptQuestion = exports.fetchForDisplay = void 0;
const replicate_1 = __importDefault(require("replicate"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma_1 = require("../../utils/prisma");
const appError_1 = require("../../lib/appError");
const replicate = new replicate_1.default({
    auth: process.env.REPLICATE_API_KEY,
});
// Topics for theory questions
const techTopics = [
    "data structures",
    "algorithms",
    "web development",
    "databases",
    "cloud computing",
    "cybersecurity",
    "machine learning",
    "DevOps",
    "programming languages",
    "software architecture",
    "API design",
    "mobile development",
    "networking",
    "version control",
    "testing and QA",
    "operating systems",
    "containerization",
    "microservices",
    "blockchain",
    "design patterns",
];
const generateQuestion = async () => {
    const randomTopic = techTopics[Math.floor(Math.random() * techTopics.length)];
    const randomSeed = Math.floor(Math.random() * 100000);
    const prompt = `
Generate a unique THEORY (open-ended) technical question about ${randomTopic}.
The question must require explanation or reasoning (no multiple-choice).

Return JSON ONLY:

{
  "question": "string",
  "modelAnswer": "string"
}

Rules:
- "question" must be something a user writes 2–5 sentences to answer.
- "modelAnswer" must be a factual expert-level explanation.
- DO NOT include options or correctAnswer.
Random seed: ${randomSeed}
  `;
    try {
        const output = await replicate.run("meta/meta-llama-3-70b-instruct", {
            input: {
                prompt,
                max_tokens: 512,
                temperature: 0.9,
                top_p: 0.95,
                seed: randomSeed,
            },
        });
        const text = Array.isArray(output) ? output.join("") : String(output);
        const cleanText = text.replace(/```json|```/g, "").trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
        if (!parsed.question || !parsed.modelAnswer) {
            throw new appError_1.InternalServerError("AI response missing required theory-question fields.");
        }
        return parsed;
    }
    catch (err) {
        throw new appError_1.InternalServerError("Invalid question format from AI: " + err.message);
    }
};
const fetchForDisplay = async (number) => {
    let quizQuestion = await prisma_1.prisma.quizQuestion.findUnique({
        where: { number },
    });
    if (quizQuestion) {
        if (quizQuestion.answeredByUserId) {
            throw new appError_1.DuplicateError(`Question number ${number} has already been answered.`);
        }
        return quizQuestion;
    }
    // Generate new theory question
    const generated = await generateQuestion();
    quizQuestion = await prisma_1.prisma.quizQuestion.create({
        data: {
            number,
            question: generated.question,
            modelAnswer: generated.modelAnswer,
            answeredByUserId: null,
        },
    });
    return quizQuestion;
};
exports.fetchForDisplay = fetchForDisplay;
const attemptQuestion = async (number, userAnswer, userId) => {
    if (typeof userAnswer !== "string") {
        throw new appError_1.BadRequestError("User answer must be a string.");
    }
    const quizConfig = await prisma_1.prisma.quizConfig.findUnique({ where: { id: 1 } });
    if (!quizConfig) {
        throw new appError_1.InternalServerError("Quiz configuration not found. Please contact admin.");
    }
    // Retrieve score
    let scoreRecord = await prisma_1.prisma.score.findUnique({ where: { userId } });
    const currentCorrectAnswers = scoreRecord ? scoreRecord.score : 0;
    // Count attempts
    const userAttempts = await prisma_1.prisma.quizQuestion.count({
        where: { answeredByUserId: userId },
    });
    if (userAttempts >= quizConfig.trials) {
        return {
            success: false,
            message: `You have used all your ${quizConfig.trials} trials.`,
            qualifiedForSpin: false,
            trialsRemaining: 0,
            userScore: currentCorrectAnswers,
        };
    }
    const quizQuestion = await prisma_1.prisma.quizQuestion.findUnique({
        where: { number },
    });
    if (!quizQuestion) {
        throw new appError_1.NotFoundError(`Question number ${number} not found.`);
    }
    if (quizQuestion.answeredByUserId) {
        if (quizQuestion.answeredByUserId === userId) {
            throw new appError_1.DuplicateError("You have already answered this question.");
        }
        throw new appError_1.ForbiddenError(`Question number ${number} has already been answered by another user.`);
    }
    let correct = false;
    try {
        const validationPrompt = `
You are grading a THEORY (open-ended) answer.

Question: ${quizQuestion.question}
Model Answer: ${quizQuestion.modelAnswer}
User Answer: ${userAnswer}

Evaluate semantic correctness (not exact words).

Return ONLY JSON:

{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "short explanation"
}
`;
        const result = await replicate.run("meta/meta-llama-3-70b-instruct", {
            input: {
                prompt: validationPrompt,
                max_tokens: 256,
                temperature: 0.1,
                top_p: 0.9,
            },
        });
        const validationText = Array.isArray(result)
            ? result.join("")
            : String(result);
        const clean = validationText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (typeof parsed.isCorrect !== "boolean") {
            throw new Error("AI returned invalid format.");
        }
        correct = parsed.isCorrect;
    }
    catch (err) {
        console.error("AI validation failed:", err);
        throw new appError_1.InternalServerError("Failed to validate answer.");
    }
    // Mark as answered
    await prisma_1.prisma.quizQuestion.update({
        where: { id: quizQuestion.id },
        data: { answeredByUserId: userId },
    });
    // Update score
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
    // Attempts after update
    const updatedUserAttempts = await prisma_1.prisma.quizQuestion.count({
        where: { answeredByUserId: userId },
    });
    const qualifiedForSpin = scoreRecord.score >= quizConfig.correctAnswersForSpin;
    const trialsRemaining = Math.max(0, quizConfig.trials - updatedUserAttempts);
    let message = "";
    if (qualifiedForSpin) {
        message = "Congratulations! You qualify to spin the wheel.";
    }
    else if (trialsRemaining === 0) {
        message = `You have used all your trials.`;
    }
    else {
        message = `You need ${quizConfig.correctAnswersForSpin - scoreRecord.score} more correct answers to qualify. ${trialsRemaining} trials remaining.`;
    }
    return {
        success: true,
        correct,
        userScore: scoreRecord.score,
        qualifiedForSpin,
        trialsRemaining,
        message,
    };
};
exports.attemptQuestion = attemptQuestion;
const updateSpinConfig = async (trials, correctAnswersForSpin) => {
    return prisma_1.prisma.quizConfig.upsert({
        where: { id: 1 },
        update: { trials, correctAnswersForSpin },
        create: { id: 1, trials, correctAnswersForSpin },
    });
};
exports.updateSpinConfig = updateSpinConfig;
