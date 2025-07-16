"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const like_contoller_1 = require("./like.contoller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const router = express_1.default.Router();
router.post('/:commentId/like', auth_middleware_1.default, like_contoller_1.toggleCommentLike);
router.post('/:commentId/unlike', auth_middleware_1.default, like_contoller_1.toggleCommentUnLike);
exports.default = router;
