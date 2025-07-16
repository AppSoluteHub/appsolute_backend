"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboardProgress = exports.getUserTaskProgress = exports.getTaskByIdHandler = exports.getAllTaskHandler = exports.getTasksHandler = void 0;
exports.createTaskHandler = createTaskHandler;
exports.deleteTaskHandler = deleteTaskHandler;
exports.updateTaskHandler = updateTaskHandler;
const task_service_1 = require("../services/task.service");
const appError_1 = require("../../../lib/appError");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
async function createTaskHandler(req, res, next) {
    try {
        Object.keys(req.body).forEach((key) => {
            const trimmed = key.trim();
            if (trimmed !== key) {
                req.body[trimmed] = req.body[key];
                delete req.body[key];
            }
        });
        const { title, description, categories, tags, url, points, questions } = req.body;
        let parsedCategories = [];
        try {
            parsedCategories = JSON.parse(categories);
        }
        catch (e) {
            parsedCategories = Array.isArray(categories) ? categories : [categories];
        }
        let parsedTags = [];
        try {
            parsedTags = JSON.parse(tags);
        }
        catch (e) {
            parsedTags = Array.isArray(tags) ? tags : [tags];
        }
        let parsedQuestions = [];
        try {
            parsedQuestions = JSON.parse(questions);
        }
        catch (e) {
            parsedQuestions = Array.isArray(questions) ? questions : [questions];
        }
        if (!title ||
            parsedCategories.length === 0 ||
            parsedTags.length === 0 ||
            !url ||
            !points ||
            parsedQuestions.length === 0) {
            console.error("Missing required fields", {
                title,
                parsedCategories,
                parsedTags,
                url,
                points,
                parsedQuestions,
            });
            throw new appError_1.BadRequestError("Title, categories, tags, url, points and questions are all required");
        }
        for (const [index, q] of parsedQuestions.entries()) {
            if (!q.questionText ||
                !q.options ||
                !Array.isArray(q.options) ||
                !q.correctAnswer) {
                console.error(`Invalid question at index ${index}:`, q);
                throw new appError_1.BadRequestError("Each question must have questionText, options (array), and correctAnswer");
            }
        }
        let imageUrl = "";
        if (req.file) {
            try {
                const file = req.file;
                imageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSolute" }, (err, result) => {
                        if (err || !result) {
                            console.error("Cloudinary upload failed:", err);
                            return reject(new appError_1.BadRequestError("Image upload failed"));
                        }
                        resolve(result.secure_url);
                    });
                    uploadStream.end(file.buffer);
                });
            }
            catch (uploadError) {
                console.error("Error during image upload:", uploadError);
                throw uploadError;
            }
        }
        const task = await (0, task_service_1.createTaskWithQuestions)(title, parsedCategories, parsedTags, url, Number(points), imageUrl, description, parsedQuestions);
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task,
        });
    }
    catch (err) {
        console.error("Unhandled error in createTaskHandler:", err);
        next(err);
    }
}
const getTasksHandler = async (req, res) => {
    const { userId } = req.params;
    try {
        const tasks = await (0, task_service_1.getAllTasks)(userId);
        res.status(200).json(tasks);
        return;
    }
    catch (error) {
        console.error("Error in getTasksHandler:", error);
        if (error instanceof appError_1.NotFoundError) {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: error.message || "Internal error" });
        return;
    }
};
exports.getTasksHandler = getTasksHandler;
const getAllTaskHandler = async (req, res) => {
    const userId = req.user?.id;
    try {
        const tasks = await (0, task_service_1.getTasks)(userId);
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
        const task = await (0, task_service_1.getTaskById)(taskId, userId);
        res.json({ mesage: "Task fetched successfully", "Task": task });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.getTaskByIdHandler = getTaskByIdHandler;
async function deleteTaskHandler(req, res, next) {
    try {
        const taskId = req.params.taskId;
        if (!taskId)
            throw new appError_1.BadRequestError("Task ID is required");
        await (0, task_service_1.deleteTaskById)(taskId);
        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    }
    catch (err) {
        next(err);
    }
}
const getUserTaskProgress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const result = await (0, task_service_1.getUserTaskProgressService)(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserTaskProgress = getUserTaskProgress;
const getLeaderboardProgress = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const result = await (0, task_service_1.getLeaderboardProgressService)(userId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getLeaderboardProgress = getLeaderboardProgress;
async function updateTaskHandler(req, res, next) {
    try {
        Object.keys(req.body).forEach((key) => {
            const trimmed = key.trim();
            if (trimmed !== key) {
                req.body[trimmed] = req.body[key];
                delete req.body[key];
            }
        });
        const taskId = req.params.taskId;
        if (!taskId)
            throw new appError_1.BadRequestError("Task ID is required");
        // 2) Destructure raw values
        const { title, description, categories, tags, url, points, questions } = req.body;
        // 3) Parse categories JSON if needed
        let parsedCategories;
        if (categories !== undefined) {
            try {
                parsedCategories = JSON.parse(categories);
            }
            catch {
                parsedCategories = Array.isArray(categories) ? categories : [categories];
            }
        }
        // 4) Parse tags (comma-list or array)
        let parsedTags;
        if (tags !== undefined) {
            if (typeof tags === "string" && tags.includes(",")) {
                parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
            }
            else if (Array.isArray(tags)) {
                parsedTags = tags;
            }
            else {
                parsedTags = [tags];
            }
        }
        // 5) **Parse questions JSON** or wrap in an array
        let parsedQuestions;
        if (questions !== undefined) {
            try {
                parsedQuestions = JSON.parse(questions);
            }
            catch {
                // if it wasn’t valid JSON, but is already an array
                if (Array.isArray(questions)) {
                    parsedQuestions = questions;
                }
                else {
                    throw new appError_1.BadRequestError("Questions must be a JSON array or an actual array");
                }
            }
            // 6) Validate shape
            if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                throw new appError_1.BadRequestError("Questions must be a non-empty array");
            }
            for (const q of parsedQuestions) {
                if (!q.questionText ||
                    !Array.isArray(q.options) ||
                    !q.correctAnswer) {
                    throw new appError_1.BadRequestError("Each question must have questionText, options (array), and correctAnswer");
                }
            }
        }
        // 7) Handle image upload (unchanged)
        let imageUrl;
        if (req.file) {
            const file = req.file;
            imageUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSolute" }, (err, result) => {
                    if (err)
                        return reject(new appError_1.BadRequestError("Image upload failed"));
                    resolve(result.secure_url);
                });
                uploadStream.end(file.buffer);
            });
        }
        // 8) Build payload
        const updatePayload = {};
        if (title !== undefined)
            updatePayload.title = title;
        if (description !== undefined)
            updatePayload.description = description;
        if (parsedCategories !== undefined)
            updatePayload.categories = parsedCategories;
        if (parsedTags !== undefined)
            updatePayload.tags = parsedTags;
        if (url !== undefined)
            updatePayload.url = url;
        if (imageUrl !== undefined)
            updatePayload.imageUrl = imageUrl;
        if (points !== undefined)
            updatePayload.points = Number(points);
        if (parsedQuestions !== undefined)
            updatePayload.questions = parsedQuestions;
        if (Object.keys(updatePayload).length === 0) {
            throw new appError_1.BadRequestError("No valid fields provided to update");
        }
        // 9) Call your service
        const updatedTask = await (0, task_service_1.updateTaskWithQuestions)(taskId, updatePayload);
        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask,
        });
    }
    catch (err) {
        next(err);
    }
}
