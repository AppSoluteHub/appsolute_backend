import { Router } from "express";
import authenticate from "../../middlewares/auth.middleware";

import {
  transformImage,
  getImageStatus,
  getUserImages,
  getImageById,
  updateImage,
  deleteImage,
  getUserStats,
} from "./ai-image.controller"
import { userRateLimiter } from "../../utils/limiter";
import { upload1 } from "../../config/multer";

const router = Router();

router.post("/generate", authenticate, userRateLimiter, upload1.single("image"), transformImage);

router.get("/:imageId/status", authenticate, getImageStatus);

router.get("/", authenticate, getUserImages);

router.get("/:imageId", authenticate, getImageById);

router.put("/:imageId", authenticate, updateImage);

router.delete("/:imageId", authenticate, deleteImage);

router.get("/stats", authenticate, getUserStats);

export default router;