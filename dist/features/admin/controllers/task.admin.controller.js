"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskHandler = exports.deleteTaskHandler = exports.getTaskByIdHandler = exports.getAllTaskHandler = exports.getTasksHandler = exports.createTaskHandler = void 0;
const task_admin_service_1 = require("../services/task.admin.service");
const createTaskHandler = async (req, res) => {
    try {
        const { title, tags, url, points, questions } = req.body;
        if (!title || !tags || !url || !points || !questions || !Array.isArray(questions)) {
            res.status(400).json({ error: "All fields are required and 'questions' must be an array" });
            return;
        }
        if (!Array.isArray(tags)) {
            res.status(400).json({ error: "Tags must be an array" });
            return;
        }
        for (const question of questions) {
            if (!question.questionText || !question.options || !question.correctAnswer || !Array.isArray(question.options)) {
                res.status(400).json({ error: "Each question must have a questionText, options (array), and a correctAnswer" });
                return;
            }
        }
        const task = await (0, task_admin_service_1.createTaskWithQuestions)(title, tags, url, points, questions);
        res.status(201).json(task);
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.createTaskHandler = createTaskHandler;
const getTasksHandler = async (req, res) => {
    const { userId } = req.body;
    try {
        const tasks = await (0, task_admin_service_1.getAllTasks)(userId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.getTasksHandler = getTasksHandler;
// export const getAllTaskHandler = async (req: Request, res: Response) => {
//   try {
//     const tasks = await getTasks();
//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };
const getAllTaskHandler = async (req, res) => {
    try {
        const tasks = await (0, task_admin_service_1.getTasks)();
        res.status(200).json({ success: true, data: tasks });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: `Error fetching tasks: ${error.message}` });
    }
};
exports.getAllTaskHandler = getAllTaskHandler;
const getTaskByIdHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const taskId = req.params.id;
        const task = await (0, task_admin_service_1.getTaskById)(taskId, userId);
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
        await (0, task_admin_service_1.deleteTask)(taskId);
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
        const { title, tags, url, points, questions } = req.body;
        if (!title || !tags || !url || !points || !questions || !Array.isArray(questions)) {
            res.status(400).json({ error: "All fields are required and 'questions' must be an array" });
            return;
        }
        for (const question of questions) {
            if (!question.id || !question.questionText || !question.options || !question.correctAnswer || !Array.isArray(question.options)) {
                res.status(400).json({ error: "Each question must have an id, questionText, options (array), and a correctAnswer" });
                return;
            }
        }
        await (0, task_admin_service_1.updateTask)(taskId, title, tags, url, points, questions);
        res.status(204).send(`Task with ID: ${taskId} was updated successfully`);
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.updateTaskHandler = updateTaskHandler;
