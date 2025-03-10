import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../controllers/task.controller"
import { validateTask } from "../../../validators/task.validation";
import { validateUpdateTask } from "../../../validators/updatePost.validator";

const router = Router();

router.post("/", createTaskHandler);
router.get("/", getTasksHandler);
router.get("/:id", getTaskByIdHandler);
router.delete("/:id",deleteTaskHandler);
router.patch("/:id",validateUpdateTask, updateTaskHandler);

export default router;

