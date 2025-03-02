import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getTasksHandler, updateTaskHandler } from "../controllers/task.controller"

const router = Router();

router.post("/", createTaskHandler);
router.get("/", getTasksHandler);
router.delete("/",deleteTaskHandler);
router.patch("/",updateTaskHandler);

export default router;

