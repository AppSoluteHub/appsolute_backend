import { Router } from "express";
import { answerTaskHandler } from "../controllers/userTask.controller";

const router = Router();

router.post("/tasks/answer", answerTaskHandler);

export default router;
