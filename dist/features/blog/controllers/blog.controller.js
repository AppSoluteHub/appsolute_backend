"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blog_service_1 = __importDefault(require("../services/blog.service"));
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
class PostController {
    static async createPost(req, res) {
        try {
            const userId = req.user?.id;
            const { title, description, category, contributors, isPublished } = req.body;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            if (!title || !description || !category) {
                res.status(400).json({
                    success: false,
                    message: "Title, category , and description are required",
                });
                return;
            }
            let imageUrl = "";
            if (req.file) {
                const file = req.file;
                imageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "posts" }, (error, result) => {
                        if (error) {
                            reject(new Error("Failed to upload image to Cloudinary"));
                        }
                        else if (result) {
                            resolve(result.secure_url);
                        }
                    });
                    uploadStream.end(file.buffer);
                });
            }
            const post = await blog_service_1.default.createPost(userId, {
                title,
                description,
                category,
                isPublished,
                contributors,
                imageUrl,
            });
            res.status(201).json({
                success: true,
                message: "Post created successfully",
                data: post,
            });
        }
        catch (error) {
            console.error("Error creating post:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async getAllPosts(req, res) {
        try {
            const { publishedOnly } = req.query;
            const posts = await blog_service_1.default.getAllPosts(publishedOnly === "true");
            res.status(200).json({
                success: true,
                data: posts,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async getPostById(req, res) {
        try {
            const { id } = req.params;
            const post = await blog_service_1.default.getPostById(id);
            res.status(200).json({
                success: true,
                data: post,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async updatePost(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { title, description, imageUrl, isPublished, } = req.body;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // Update post
            const updatedPost = await blog_service_1.default.updatePost(id, userId, {
                title,
                description,
                imageUrl,
                isPublished,
            });
            // Handle case if post wasn't found
            if (!updatedPost) {
                res.status(404).json({ success: false, message: "Post not found" });
            }
            // Respond with success
            res.status(200).json({
                success: true,
                message: "Post updated successfully",
                data: updatedPost,
            });
        }
        catch (error) {
            // Handle unexpected errors
            console.error(error); // Log error for debugging
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async deletePost(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            console.log(userId);
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            await blog_service_1.default.deletePost(id, userId);
            res.status(200).json({
                success: true,
                message: "Post deleted successfully",
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
}
exports.default = PostController;
