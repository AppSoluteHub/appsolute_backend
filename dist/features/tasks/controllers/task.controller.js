"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskHandler = exports.deleteTaskHandler = exports.getTaskByIdHandler = exports.getTasksHandler = exports.createTaskHandler = void 0;
const task_service_1 = require("../services/task.service");
const createTaskHandler = async (req, res) => {
    try {
        const { question, options, correctAnswer, url } = req.body;
        if (!question || !options || !correctAnswer) {
            res.status(400).json({ error: "All fields are required" });
        }
        if (!Array.isArray(options)) {
            res.status(400).json({ error: "Options must be an array" });
        }
        const task = await (0, task_service_1.createTask)(question, options, correctAnswer, url);
        res.status(201).json(task);
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: error || "Internal Server Error" });
    }
};
exports.createTaskHandler = createTaskHandler;
const getTasksHandler = async (req, res) => {
    try {
        const tasks = await (0, task_service_1.getAllTasks)();
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.getTasksHandler = getTasksHandler;
const getTaskByIdHandler = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await (0, task_service_1.getTaskById)(taskId);
        res.json({ mesage: "Task fetched successfully", "Task": task });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.getTaskByIdHandler = getTaskByIdHandler;
const deleteTaskHandler = async (req, res) => {
    try {
        const taskId = req.params.id;
        await (0, task_service_1.deleteTask)(taskId);
        res.status(204).send(`Task of Id : ${taskId} was deleted successfully`);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.deleteTaskHandler = deleteTaskHandler;
const updateTaskHandler = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { question, options, correctAnswer } = req.body;
        await (0, task_service_1.updateTask)(taskId, question, options, correctAnswer);
        res.status(204).send(`Task of Id : ${taskId} was updated successfully`);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.updateTaskHandler = updateTaskHandler;
