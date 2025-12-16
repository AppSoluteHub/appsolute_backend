import { Router } from "express";
import multer from "multer";
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

const router = Router();


const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.post("/generate", authenticate, upload.single("image"), transformImage);

router.get("/:imageId/status", authenticate, getImageStatus);

router.get("/", authenticate, getUserImages);

router.get("/:imageId", authenticate, getImageById);

router.put("/:imageId", authenticate, updateImage);

router.delete("/:imageId", authenticate, deleteImage);

router.get("/stats", authenticate, getUserStats);

export default router;