"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const task_controller_1 = require("../../tasks/controllers/task.controller");
const taskUpdate_validator_1 = require("../../../validators/taskUpdate.validator");
const router = express_1.default.Router();
router.post("/createTask", auth_middleware_1.default, task_controller_1.createTaskHandler);
router.get("/", task_controller_1.getTasksHandler);
router.get("/allTasks", task_controller_1.getAllTaskHandler);
router.get("/:id", task_controller_1.getTaskByIdHandler);
router.delete("/:id", auth_middleware_1.default, task_controller_1.deleteTaskHandler);
router.patch("/:id", auth_middleware_1.default, taskUpdate_validator_1.validateUpdateTask, task_controller_1.updateTaskHandler);
exports.default = router;
