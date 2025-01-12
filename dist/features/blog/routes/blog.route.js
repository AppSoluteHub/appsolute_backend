"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.default, blog_controller_1.default.createPost);
router.get("/", blog_controller_1.default.getAllPosts);
router.get("/:id", blog_controller_1.default.getPostById);
// Update a post by ID (protected route)
// router.put("/:id", authenticate, PostController.updatePost);
// Delete a post by ID (protected route)
// router.delete("/:id", authenticate, PostController.deletePost);
exports.default = router;
