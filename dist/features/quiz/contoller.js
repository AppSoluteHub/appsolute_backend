"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAttempt = exports.getQuestion = void 0;
const service_1 = require("./service");
const getQuestion = async (req, res) => {
    const number = Number(req.params.number);
    if (isNaN(number)) {
        res.status(400).json({ error: 'Invalid question number' });
        return;
    }
    try {
        const question = await (0, service_1.fetchForDisplay)(number);
        if (!question) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        res.json(question);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getQuestion = getQuestion;
// Controller to attempt a question
const postAttempt = async (req, res) => {
    const number = Number(req.params.number);
    const { userAnswer, userId } = req.body;
    if (!userAnswer || !userId) {
        res.status(400).json({ error: 'Missing userAnswer or userId' });
        return;
    }
    if (isNaN(number)) {
        res.status(400).json({ error: 'Invalid question number' });
        return;
    }
    try {
        const result = await (0, service_1.attemptQuestion)(number, userAnswer, userId);
        if (!result.success) {
            res.status(400).json({ error: result.error });
            return;
        }
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.postAttempt = postAttempt;
