"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_image_controller_1 = require("./ai-image.controller");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
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
router.post('/generate', auth_middleware_1.default, upload.single('image'), ai_image_controller_1.AiImageController.generateImage);
router.get('/', ai_image_controller_1.AiImageController.getUserImages);
router.get('/:id', ai_image_controller_1.AiImageController.getImageById);
router.get('/stats', ai_image_controller_1.AiImageController.getUserStats);
router.put('/:id', ai_image_controller_1.AiImageController.updateImage);
router.delete('/:id', ai_image_controller_1.AiImageController.deleteImage);
exports.default = router;
