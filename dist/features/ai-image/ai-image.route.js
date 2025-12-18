"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const ai_image_controller_1 = require("./ai-image.controller");
const limiter_1 = require("../../utils/limiter");
const multer_1 = require("../../config/multer");
const router = (0, express_1.Router)();
router.post("/generate", auth_middleware_1.default, limiter_1.userRateLimiter, multer_1.upload1.single("image"), ai_image_controller_1.transformImage);
router.get("/:imageId/status", auth_middleware_1.default, ai_image_controller_1.getImageStatus);
router.get("/", auth_middleware_1.default, ai_image_controller_1.getUserImages);
router.get("/:imageId", auth_middleware_1.default, ai_image_controller_1.getImageById);
router.put("/:imageId", auth_middleware_1.default, ai_image_controller_1.updateImage);
router.delete("/:imageId", auth_middleware_1.default, ai_image_controller_1.deleteImage);
router.get("/stats", auth_middleware_1.default, ai_image_controller_1.getUserStats);
exports.default = router;
