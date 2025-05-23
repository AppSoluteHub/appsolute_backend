import { Router } from "express";
import { createTaskHandler, deleteTaskHandler, getAllTaskHandler, getTaskByIdHandler, getTasksHandler, updateTaskHandler } from "../controllers/task.controller"
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { createTaskSchema, updateTaskSchema, validate } from "../../../validators/task.validation";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/", authenticate,isAdmin,validate(createTaskSchema) ,upload.single("file"),createTaskHandler);
router.get("/undoneTasks/:userId",getTasksHandler);
router.get("/:id", getTaskByIdHandler);
router.get("/", getAllTaskHandler);

router.delete("/:taskId",authenticate,deleteTaskHandler);
router.patch("/:taskId", authenticate,validate(updateTaskSchema) ,updateTaskHandler);

export default router;
