"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const post_validator_1 = require("../../../validators/post.validator");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.post("/", auth_middleware_1.default, upload.single("file"), post_validator_1.validatePost, blog_controller_1.default.createPost);
router.get("/", blog_controller_1.default.getAllPosts);
router.get("/:id", blog_controller_1.default.getPostById);
router.delete("/:id", auth_middleware_1.default, blog_controller_1.default.deletePost);
router.put("/:id", auth_middleware_1.default, blog_controller_1.default.updatePost);
exports.default = router;
