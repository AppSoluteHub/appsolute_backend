"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blog_service_1 = __importDefault(require("../services/blog.service"));
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const appError_1 = require("../../../lib/appError");
const appResponse_1 = __importDefault(require("../../../lib/appResponse"));
class PostController {
    static async createPost(req, res, next) {
        try {
            const userId = req.user?.id;
            const editorRole = req.user?.role;
            if (!userId)
                throw new appError_1.UnAuthorizedError("Unauthorized");
            const { title, description, categories, tags, contributors, isPublished, } = req.body;
            let parsedCategories = [];
            if (categories) {
                try {
                    parsedCategories = JSON.parse(categories);
                }
                catch {
                    parsedCategories = Array.isArray(categories)
                        ? categories
                        : [categories];
                }
            }
            const parsedTags = tags
                ? typeof tags === "string"
                    ? tags.split(",").map(t => t.trim()).filter(Boolean)
                    : Array.isArray(tags)
                        ? tags
                        : []
                : [];
            let parsedContributors = [];
            if (contributors) {
                try {
                    parsedContributors = JSON.parse(contributors);
                }
                catch {
                    parsedContributors = Array.isArray(contributors)
                        ? contributors
                        : [contributors];
                }
            }
            if (!title ||
                parsedCategories.length === 0) {
                throw new appError_1.BadRequestError("Title, and at least one category are required");
            }
            let imageUrl = "";
            if (req.file) {
                const file = req.file;
                imageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSolute" }, (err, result) => {
                        if (err)
                            return reject(new appError_1.BadRequestError("Image upload failed"));
                        resolve(result.secure_url);
                    });
                    uploadStream.end(file.buffer);
                });
            }
            const post = await blog_service_1.default.createPost(userId, editorRole, {
                title,
                description,
                categories: parsedCategories,
                tags: parsedTags,
                contributors: parsedContributors,
                isPublished: Boolean(isPublished),
                imageUrl,
            });
            res.status(201).json({
                success: true,
                message: "Post created successfully",
                data: post,
            });
            return;
        }
        catch (err) {
            return next(err);
        }
    }
    static async getAllPosts(req, res, next) {
        try {
            const { publishedOnly } = req.query;
            const posts = await blog_service_1.default.getAllPosts(publishedOnly === "true");
            res.send((0, appResponse_1.default)("Posts fetched successfully", posts));
        }
        catch (error) {
            next(error);
        }
    }
    static async getPostById(req, res, next) {
        try {
            const { postId } = req.params;
            const post = await blog_service_1.default.getPostById(postId);
            res.send((0, appResponse_1.default)("Post fetched successfully", post));
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePost(req, res, next) {
        try {
            const userId = req.user?.id;
            const { postId } = req.params;
            const { title, description, isPublished, tags, categories, contributors, } = req.body;
            if (!userId)
                throw new appError_1.UnAuthorizedError("You are not Authenticated");
            let imageUrl = "";
            if (req.file) {
                const file = req.file;
                imageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSolute" }, (err, result) => {
                        if (err)
                            return reject(new appError_1.BadRequestError("Image upload failed"));
                        resolve(result.secure_url);
                    });
                    uploadStream.end(file.buffer);
                });
            }
            const updatedPost = await blog_service_1.default.updatePost(postId, userId, {
                title,
                description,
                imageUrl,
                isPublished,
                tags,
                categories,
                contributors,
            });
            res.send((0, appResponse_1.default)("Post updated successfully", updatedPost));
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePost(req, res, next) {
        try {
            const userId = req.user?.id;
            const { postId } = req.params;
            if (!userId)
                throw new appError_1.UnAuthorizedError("You are not Authenticated");
            await blog_service_1.default.deletePost(postId, userId);
            res.send((0, appResponse_1.default)("Post deleted successfully"));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PostController;
