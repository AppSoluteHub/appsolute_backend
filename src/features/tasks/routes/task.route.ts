import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../controllers/task.controller"

const router = Router();

router.post("/", createTaskHandler);
router.get("/", getTasksHandler);
router.get("/:id", getTaskByIdHandler);
router.delete("/",deleteTaskHandler);
router.patch("/",updateTaskHandler);

export default router;

