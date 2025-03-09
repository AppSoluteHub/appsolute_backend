"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importStar(require("../../../middlewares/auth.middleware"));
const comment_controller_1 = require("../../comments/comment.controller");
const commentController = new comment_controller_1.CommentController();
const commentRouter = express_1.default.Router();
commentRouter.post("/:postId", auth_middleware_1.default, auth_middleware_1.isAdmin, commentController.createComment);
commentRouter.get("/:postId", auth_middleware_1.default, auth_middleware_1.isAdmin, commentController.getCommentsByPostId);
commentRouter.put("/:commentId", auth_middleware_1.default, auth_middleware_1.isAdmin, commentController.updateComment);
commentRouter.delete("/:id", auth_middleware_1.default, auth_middleware_1.isAdmin, commentController.deleteComment);
exports.default = commentRouter;
