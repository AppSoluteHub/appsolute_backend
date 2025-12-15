"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const ai_image_controller_1 = require("./ai-image.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.post("/generate", auth_middleware_1.default, upload.single("image"), ai_image_controller_1.transformImage);
// Get image status (for polling)
router.get("/:imageId/status", auth_middleware_1.default, ai_image_controller_1.getImageStatus);
// Get user images
router.get("/", auth_middleware_1.default, ai_image_controller_1.getUserImages);
// Get single image
router.get("/:imageId", auth_middleware_1.default, ai_image_controller_1.getImageById);
// Update image (async)
router.put("/:imageId", auth_middleware_1.default, ai_image_controller_1.updateImage);
// Delete image
router.delete("/:imageId", auth_middleware_1.default, ai_image_controller_1.deleteImage);
// Get user stats
router.get("/stats", auth_middleware_1.default, ai_image_controller_1.getUserStats);
exports.default = router;
