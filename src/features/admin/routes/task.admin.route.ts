import expres from "express";
import authenticate from "../../../middlewares/auth.middleware";
import { createTaskHandler, deleteTaskHandler, getAllTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../../tasks/controllers/task.controller";
import { validateUpdateTask } from "../../../validators/taskUpdate.validator";
const router = expres.Router();

router.post("/createTask", authenticate, createTaskHandler);
router.get("/",getTasksHandler);
router.get("/allTasks", getAllTaskHandler);
router.get("/:id", getTaskByIdHandler);
router.delete("/:id",authenticate,deleteTaskHandler);
router.patch("/:id", authenticate,validateUpdateTask, updateTaskHandler);

export default router;