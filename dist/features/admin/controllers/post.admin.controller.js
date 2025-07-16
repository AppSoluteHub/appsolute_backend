"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const post_admin_service_1 = __importDefault(require("../services/post.admin.service"));
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const appError_1 = require("../../../lib/appError");
const appResponse_1 = __importDefault(require("../../../lib/appResponse"));
class PostController {
    static async createPost(req, res, next) {
        try {
            const userId = req.user?.id;
            const { title, description, category, contributors, isPublished } = req.body;
            if (!userId)
                throw new appError_1.UnAuthorizedError("Unauthorized");
            if (!title || !description || !category)
                throw new appError_1.BadRequestError("Title, category, and description are required");
            const sanitizedCategory = Array.isArray(category)
                ? category.map((cat) => cat.trim())
                : [String(category).trim()];
            let imageUrl = "";
            if (req.file) {
                try {
                    const file = req.file;
                    imageUrl = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSolute" }, (error, result) => {
                            if (error)
                                return reject(new appError_1.BadRequestError("Failed to upload image to Cloudinary"));
                            if (result)
                                return resolve(result.secure_url);
                        });
                        uploadStream.end(file.buffer);
                    });
                }
                catch (error) {
                    return next(error);
                }
            }
            const post = await post_admin_service_1.default.createPost(userId, {
                title,
                description,
                category: sanitizedCategory,
                isPublished,
                contributors,
                imageUrl,
            });
            res.status(201).json({
                success: true,
                message: "Post created successfully",
                data: {
                    title: post.title,
                    fullName: post.author.fullName,
                    profileImage: post.author.profileImage,
                    role: post.author.role,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllPosts(req, res, next) {
        try {
            const { publishedOnly } = req.query;
            const posts = await post_admin_service_1.default.getAllPosts(publishedOnly === "true");
            const filteredPosts = posts.map((post) => ({
                title: post.title,
                fullName: post.author?.fullName,
                profileImage: post.author?.profileImage,
                role: post.author?.role,
            }));
            res.send((0, appResponse_1.default)("Posts fetched successfully", posts));
        }
        catch (error) {
            next(error);
        }
    }
    static async getPostById(req, res, next) {
        try {
            const { id } = req.params;
            const post = await post_admin_service_1.default.getPostById(id);
            res.send((0, appResponse_1.default)("Post fetched successfully", post));
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePost(req, res, next) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { title, description, imageUrl, isPublished } = req.body;
            if (!userId)
                throw new appError_1.UnAuthorizedError("You are not Authenticated");
            const updatedPost = await post_admin_service_1.default.updatePost(id, userId, {
                title,
                description,
                imageUrl,
                isPublished,
            });
            if (!updatedPost)
                throw new appError_1.BadRequestError("Post not found");
            res.send((0, appResponse_1.default)("Post updated successfully", updatedPost));
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePost(req, res, next) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId)
                throw new appError_1.UnAuthorizedError("You are not Authenticated");
            await post_admin_service_1.default.deletePost(id, userId);
            res.send((0, appResponse_1.default)("Post deleted successfully"));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PostController;
