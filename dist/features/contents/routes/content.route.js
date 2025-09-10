"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const content_controller_1 = require("../controllers/content.controller");
const router = express_1.default.Router();
router.get("/videos", content_controller_1.getYouTubeVideos);
router.get("/kidsVideos", content_controller_1.getYouTubeVideosKids);
exports.default = router;
