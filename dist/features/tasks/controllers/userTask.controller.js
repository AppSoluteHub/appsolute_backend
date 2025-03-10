"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerTaskHandler = void 0;
const userTask_service_1 = require("../services/userTask.service");
const answerTaskHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { taskId } = req.params;
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            res.status(400).json({ error: "Answers must be provided in an array." });
            return;
        }
        const response = await (0, userTask_service_1.answerTask)(userId, taskId, answers);
        res.status(200).json(response);
        return;
    }
    catch (error) {
        console.error("Error in answerTaskHandler:", error);
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};
exports.answerTaskHandler = answerTaskHandler;
