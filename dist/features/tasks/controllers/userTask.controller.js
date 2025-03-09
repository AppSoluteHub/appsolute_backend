"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerTaskHandler = void 0;
const userTask_service_1 = require("../services/userTask.service");
const appError_1 = require("../../../lib/appError");
const answerTaskHandler = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { taskId, userAnswer } = req.body;
        if (!userId) {
            res.status(401).json({ error: "You are not authenticated" });
            return;
        }
        if (!taskId || !userAnswer) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const userTask = await (0, userTask_service_1.answerTask)(userId, taskId, userAnswer);
        res.status(201).json(userTask);
    }
    catch (error) {
        console.error("Error in answerTaskHandler:", error);
        if (error instanceof appError_1.BadRequestError) {
            res.status(400).json({ error: error.message });
        }
        else if (error instanceof appError_1.InternalServerError) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
};
exports.answerTaskHandler = answerTaskHandler;
