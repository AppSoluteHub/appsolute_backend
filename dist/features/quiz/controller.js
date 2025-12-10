"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuizConfig = exports.postAttempt = exports.getQuestion = void 0;
const service_1 = require("./service");
const appError_1 = require("../../lib/appError");
const catchAsync_1 = require("../../utils/catchAsync");
const nlp_helper_1 = require("../../utils/nlp.helper");
exports.getQuestion = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user?.id) {
        throw new appError_1.UnAuthorizedError("User not authorized, please login");
    }
    const rawInput = req.params.number;
    const parsed = nlp_helper_1.NLPHelper.parseQuestionNumber(String(rawInput));
    if (!parsed.number) {
        res.status(400).json({
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'invalid_input',
                data: { input: rawInput }
            }),
            aiStyle: true,
            suggestion: "Try: '5', 'five', 'question 5', or 'number five'"
        });
        return;
    }
    if (parsed.number < 1 || parsed.number > 100) {
        res.status(400).json({
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'range_error',
                data: { number: parsed.number }
            }),
            aiStyle: true
        });
        return;
    }
    try {
        const question = await (0, service_1.fetchForDisplay)(parsed.number);
        if ((0, service_1.isQuizError)(question)) {
            res.status(400).json(question);
            return;
        }
        const response = { ...question };
        if (parsed.confidence === 'medium') {
            response.aiNote = nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'uncertain_parse',
                data: { number: parsed.number, input: rawInput }
            });
        }
        else if (parsed.confidence === 'low') {
            response.aiNote = nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'uncertain_parse',
                data: { number: parsed.number, input: rawInput }
            });
        }
        res.json(response);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'server_error'
            }),
            aiStyle: true,
            technical: err.message
        });
    }
});
exports.postAttempt = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new appError_1.UnAuthorizedError("User not authorized, please login");
    }
    const rawNumber = req.params.number;
    const parsed = nlp_helper_1.NLPHelper.parseQuestionNumber(String(rawNumber));
    if (!parsed.number || parsed.number < 1 || parsed.number > 100) {
        res.status(400).json({
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'invalid_input',
                data: { input: rawNumber }
            }),
            aiStyle: true
        });
        return;
    }
    const { userAnswer } = req.body;
    if (!userAnswer || typeof userAnswer !== 'string' || userAnswer.trim().length === 0) {
        res.status(400).json({
            message: "I didn't see your answer! Could you write out your response? I'm looking for 2-5 sentences explaining your thinking. 📝",
            aiStyle: true
        });
        return;
    }
    const wordCount = userAnswer.trim().split(/\s+/).length;
    if (wordCount < 5) {
        res.status(400).json({
            message: "That's a bit short! Could you explain a bit more? I need at least a few sentences to properly evaluate your understanding. Think of it like explaining to a friend! 😊",
            aiStyle: true,
            suggestion: "Aim for 2-5 sentences"
        });
        return;
    }
    try {
        const result = await (0, service_1.attemptQuestion)(parsed.number, userAnswer, userId);
        if (!result.success) {
            res.status(400).json(result);
            return;
        }
        console.log(result);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        if (err.message.includes('already answered')) {
            res.status(400).json({
                message: err.message,
                aiStyle: true
            });
        }
        else {
            res.status(500).json({
                message: "Hmm, I ran into trouble processing your answer. Mind trying again?",
                aiStyle: true,
                error: err.message
            });
        }
    }
});
exports.updateQuizConfig = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { trials, correctAnswersForSpin } = req.body;
    if (typeof trials !== 'number' || trials <= 0 || !Number.isInteger(trials)) {
        throw new appError_1.BadRequestError("Trials must be a positive integer.");
    }
    if (typeof correctAnswersForSpin !== 'number' || correctAnswersForSpin <= 0 || !Number.isInteger(correctAnswersForSpin)) {
        throw new appError_1.BadRequestError("Correct answers for spin must be a positive integer.");
    }
    const config = await (0, service_1.updateSpinConfig)(trials, correctAnswersForSpin);
    res.status(200).json({
        status: 'success',
        data: config,
        message: `Quiz config updated! Players now get ${trials} trials and need ${correctAnswersForSpin} correct answers to spin the wheel.`
    });
});
