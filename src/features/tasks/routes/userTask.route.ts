import { Router } from "express";
import { answerTaskHandler } from "../controllers/userTask.controller";

const router = Router();

router.post("/answer/:userId", answerTaskHandler);

export default router;
