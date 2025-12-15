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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.post("/generate", authenticate, upload.single("image"), transformImage);

// Get image status (for polling)
router.get("/:imageId/status", authenticate, getImageStatus);

// Get user images
router.get("/", authenticate, getUserImages);

// Get single image
router.get("/:imageId", authenticate, getImageById);

// Update image (async)
router.put("/:imageId", authenticate, updateImage);

// Delete image
router.delete("/:imageId", authenticate, deleteImage);

// Get user stats
router.get("/stats", authenticate, getUserStats);
export default router;