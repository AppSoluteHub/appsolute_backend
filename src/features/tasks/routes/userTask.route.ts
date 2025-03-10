import { Router } from "express";
import { answerTaskHandler } from "../controllers/userTask.controller";
import authenticate from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/answer/:userId",authenticate, answerTaskHandler);

export default router;
