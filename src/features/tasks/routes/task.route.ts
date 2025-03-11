import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../controllers/task.controller"
import { validateTask } from "../../../validators/task.validation";
import { validateUpdateTask } from "../../../validators/updatePost.validator";
import authenticate from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createTaskHandler);
router.get("/", getTasksHandler);
router.get("/:id", getTaskByIdHandler);
router.delete("/:id",authenticate,deleteTaskHandler);
router.patch("/:id",authenticate,validateUpdateTask, updateTaskHandler);

export default router;

