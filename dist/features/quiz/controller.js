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
    const rawInput = req.body.number;
    // Parse natural language input
    const parsed = nlp_helper_1.NLPHelper.parseQuestionNumber(String(rawInput));
    if (!parsed.number) {
        res.status(200).json({
            success: false,
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
        res.status(200).json({
            success: false,
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
            res.status(200).json(question);
            return;
        }
        const response = {
            ...question
        };
        if (parsed.confidence === 'medium' || parsed.confidence === 'low') {
            response.aiNote = nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'uncertain_parse',
                data: { number: parsed.number, input: rawInput }
            });
        }
        res.status(200).json(response);
    }
    catch (err) {
        console.error(err);
        res.status(200).json({
            success: false,
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'server_error'
            }),
            aiStyle: true,
            // technical: err.message 
        });
    }
});
exports.postAttempt = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new appError_1.UnAuthorizedError("User not authorized, please login");
    }
    const rawNumber = req.params.number;
    // Parse question number with NLP
    const parsed = nlp_helper_1.NLPHelper.parseQuestionNumber(String(rawNumber));
    if (!parsed.number || parsed.number < 1 || parsed.number > 100) {
        res.status(200).json({
            success: false,
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: parsed.number && (parsed.number < 1 || parsed.number > 100)
                    ? 'range_error'
                    : 'invalid_input',
                data: { input: rawNumber, number: parsed.number }
            }),
            aiStyle: true
        });
        return;
    }
    const { userAnswer } = req.body;
    if (!userAnswer || typeof userAnswer !== 'string' || userAnswer.trim().length === 0) {
        res.status(200).json({
            success: false,
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'missing_answer'
            }),
            aiStyle: true
        });
        return;
    }
    const wordCount = userAnswer.trim().split(/\s+/).length;
    if (wordCount < 5) {
        res.status(200).json({
            success: false,
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'short_answer'
            }),
            aiStyle: true,
            suggestion: "Aim for 2-5 sentences"
        });
        return;
    }
    try {
        const result = await (0, service_1.attemptQuestion)(parsed.number, userAnswer, userId);
        console.log(result);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('Unexpected error:', err);
        res.status(200).json({
            success: false,
            message: nlp_helper_1.NLPHelper.generateConversationalMessage({
                type: 'server_error'
            }),
            aiStyle: true,
            technical: err.message // Keep for debugging
        });
    }
});
exports.updateQuizConfig = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { trials, correctAnswersForSpin } = req.body;
    if (typeof trials !== 'number' || trials <= 0 || !Number.isInteger(trials)) {
        res.status(200).json({
            success: false,
            message: "Trials must be a positive integer. Give me a whole number greater than 0!",
            aiStyle: true
        });
        return;
    }
    if (typeof correctAnswersForSpin !== 'number' || correctAnswersForSpin <= 0 || !Number.isInteger(correctAnswersForSpin)) {
        res.status(200).json({
            success: false,
            message: "Correct answers for spin must be a positive integer. Give me a whole number greater than 0!",
            aiStyle: true
        });
        return;
    }
    const config = await (0, service_1.updateSpinConfig)(trials, correctAnswersForSpin);
    res.status(200).json({
        success: true,
        data: config,
        message: `Quiz config updated! Players now get ${trials} trials and need ${correctAnswersForSpin} correct answers to spin the wheel. `
    });
});
