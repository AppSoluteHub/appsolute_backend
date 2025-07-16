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
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const auth_middleware_1 = __importStar(require("../../../middlewares/auth.middleware"));
const multer_1 = __importDefault(require("multer"));
const comment_controller_1 = require("../../comments/comment.controller");
const imageUpload_1 = require("../controllers/imageUpload");
const commentController = new comment_controller_1.CommentController();
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.post("/image-upload", auth_middleware_1.default, upload.single("file"), imageUpload_1.ImageController.uploadImage);
router.post("/", auth_middleware_1.default, auth_middleware_1.isAdmin, upload.single("file"), blog_controller_1.default.createPost);
router.get("/", blog_controller_1.default.getAllPosts);
router.get("/:postId", blog_controller_1.default.getPostById);
router.delete("/:postId", auth_middleware_1.default, blog_controller_1.default.deletePost);
router.patch("/:postId", auth_middleware_1.default, auth_middleware_1.isAdmin, upload.single("file"), blog_controller_1.default.updatePost);
router.post("/:postId/comment", auth_middleware_1.default, commentController.createComment);
router.get("/:postId/comment", auth_middleware_1.default, commentController.getCommentsByPostId);
router.put("/:postId/comment", auth_middleware_1.default, commentController.updateComment);
router.delete("/:postId/comment", auth_middleware_1.default, commentController.deleteComment);
exports.default = router;
