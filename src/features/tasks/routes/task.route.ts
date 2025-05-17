import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getAllTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../controllers/task.controller"
import { validateTask } from "../../../validators/task.validation";
import { validateUpdateTask } from "../../../validators/updatePost.validator";
import authenticate, { isAdmin, isSuperAdmin } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate,isAdmin,isSuperAdmin, createTaskHandler);
router.get("/:userId",getTasksHandler);
router.get("/allTasks", getAllTaskHandler);
router.get("/:id", getTaskByIdHandler);
router.delete("/:taskId",authenticate,deleteTaskHandler);
router.patch("/:taskId", authenticate, updateTaskHandler);

export default router;
