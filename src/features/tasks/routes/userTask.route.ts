import { Router } from "express";
import { answerTaskHandler } from "../controllers/userTask.controller";
import authenticate from "../../../middlewares/auth.middleware";
// import authenticate from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/answer/:taskId", authenticate, answerTaskHandler);

export default router;
