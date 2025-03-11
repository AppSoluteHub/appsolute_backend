"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const updatePost_validator_1 = require("../../../validators/updatePost.validator");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.default, task_controller_1.createTaskHandler);
router.get("/", task_controller_1.getTasksHandler);
router.get("/:id", task_controller_1.getTaskByIdHandler);
router.delete("/:id", auth_middleware_1.default, task_controller_1.deleteTaskHandler);
router.patch("/:id", auth_middleware_1.default, updatePost_validator_1.validateUpdateTask, task_controller_1.updateTaskHandler);
exports.default = router;
