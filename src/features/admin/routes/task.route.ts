import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../../tasks/controllers/task.controller";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/tasks",authenticate,isAdmin, createTaskHandler);
router.get("/",authenticate,isAdmin ,getTasksHandler);
router.get("/:id",authenticate,isAdmin, getTaskByIdHandler);
router.delete("/",authenticate,isAdmin, deleteTaskHandler);
router.patch("/",authenticate, isAdmin, updateTaskHandler);

export default router;
