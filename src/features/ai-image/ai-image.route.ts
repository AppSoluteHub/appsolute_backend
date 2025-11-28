import { Router } from "express";
import { AiImageController } from "./ai-image.controller";
import multer from "multer";
import authenticate from "../../middlewares/auth.middleware";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/generate",
  authenticate,
  upload.single("image"),
  AiImageController.generateImage
);

export default router;
