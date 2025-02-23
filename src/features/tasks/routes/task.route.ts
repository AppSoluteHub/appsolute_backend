import { Router } from "express";
import { createTaskHandler, getTasksHandler } from "../controllers/task.controller";

const router = Router();

router.post("/create", createTaskHandler);
router.get("/", getTasksHandler);

export default router;

