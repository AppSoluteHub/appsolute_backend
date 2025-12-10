"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuizConfig = exports.postAttempt = exports.getQuestion = void 0;
const service_1 = require("./service");
const appError_1 = require("../../lib/appError");
const catchAsync_1 = require("../../utils/catchAsync");
const validateNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return 'Question number is required, ensure is a valid number (1-100)';
    }
    const num = Number(value);
    if (isNaN(num)) {
        return 'Question number is required, ensure is a valid number (1-100)';
    }
    if (num < 1 || num > 100) {
        return 'Question number must be between 1 and 100';
    }
    return null;
};
exports.getQuestion = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (req.user?.id === undefined) {
        throw new appError_1.UnAuthorizedError("User not authorized, please login");
    }
    const error = validateNumber(req.body.number);
    if (error) {
        throw new appError_1.BadRequestError(error);
    }
    const number = Number(req.body.number);
    const question = await (0, service_1.fetchForDisplay)(number);
    // const { correctAnswer, ...safe } = question;
    res.json(question);
});
exports.postAttempt = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new appError_1.UnAuthorizedError("User not authorized, please login");
    }
    const number = Number(req.params.number);
    const error = validateNumber(number);
    if (error) {
        throw new appError_1.BadRequestError(error);
    }
    const { userAnswer } = req.body;
    if (!userAnswer) {
        throw new appError_1.BadRequestError("Missing userAnswer,please provide an answer to proceed.");
    }
    const result = await (0, service_1.attemptQuestion)(number, userAnswer, userId);
    if (!result.success) {
        throw new appError_1.InternalServerError("Failed to attempt question");
    }
    console.log(result);
    res.json(result);
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
    });
});
