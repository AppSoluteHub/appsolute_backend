"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskHandler = exports.deleteTaskHandler = exports.getTaskByIdHandler = exports.getTasksHandler = exports.createTaskHandler = void 0;
const task_service_1 = require("../services/task.service");
// export const createTaskHandler = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { question, options, correctAnswer, url, title, points, tags } = req.body;
//     if (!question || !options || !correctAnswer || !url || !title || !tags || !points) {
//        res.status(400).json({ error: "All fields are required" });
//        return;
//     }
//     if (!Array.isArray(options)) {
//        res.status(400).json({ error: "Options must be an array" });
//        return;
//     }
//     if (!Array.isArray(tags)) {
//        res.status(400).json({ error: "Tags must be an array" });
//        return;
//     }
//     const task = await createTask(question, options, correctAnswer, url, tags, points, title);
//     res.status(201).json(task);
//   } catch (error) {
//     console.error("Error creating task:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
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
        const task = await (0, task_service_1.createTaskWithQuestions)(title, tags, url, points, questions);
        res.status(201).json(task);
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
        await (0, task_service_1.updateTask)(taskId, title, tags, url, points, questions);
        res.status(204).send(`Task with ID: ${taskId} was updated successfully`);
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.updateTaskHandler = updateTaskHandler;
