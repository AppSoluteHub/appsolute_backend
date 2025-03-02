"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerTaskHandler = void 0;
const userTask_service_1 = require("../services/userTask.service");
const answerTaskHandler = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        const { taskId, userAnswer } = req.body;
        if (!userId) {
            res.status(401).json({ error: "You are not authenticated" });
        }
        if (!taskId || !userAnswer) {
            res.status(400).json({ error: "All fields are required" });
        }
        ;
        const userTask = await (0, userTask_service_1.answerTask)(userId, taskId, userAnswer);
        res.status(201).json(userTask);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.answerTaskHandler = answerTaskHandler;
