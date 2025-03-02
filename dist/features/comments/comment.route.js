"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("./comment.controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const commentRouter = (0, express_1.Router)();
const commentController = new comment_controller_1.CommentController();
commentRouter.post("/:postId", auth_middleware_1.default, commentController.createComment);
commentRouter.get("/:postId", auth_middleware_1.default, commentController.getCommentsByPostId);
commentRouter.put("/:commentId", auth_middleware_1.default, commentController.updateComment);
commentRouter.delete("/:id", auth_middleware_1.default, commentController.deleteComment);
exports.default = commentRouter;
