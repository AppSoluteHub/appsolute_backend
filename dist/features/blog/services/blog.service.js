"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class PostService {
    static async createPost(userId, postData) {
        const { title, imageUrl, description, category, contributors, isPublished } = postData;
        if (!title || !description || !imageUrl) {
            throw new appError_1.BadRequestError("Title, description, and imageUrl are required");
        }
        const validCategories = [
            "AI",
            "TECHNOLOGY",
            "MARKETING",
            "DESIGN",
            "SOFTWARE",
        ];
        const sanitizedCategory = category?.trim().toUpperCase();
        const postCategory = validCategories.includes(sanitizedCategory)
            ? [sanitizedCategory]
            : ["TECHNOLOGY"];
        const postContributors = Array.isArray(contributors) ? contributors : [];
        try {
            const post = await prisma.post.create({
                data: {
                    title,
                    description,
                    category: postCategory,
                    authorId: userId,
                    imageUrl,
                    contributors: postContributors,
                    isPublished: isPublished ?? false,
                },
            });
            return post;
        }
        catch (error) {
            console.error("Error creating post:", error);
            if (error instanceof appError_1.AppError)
                throw error;
            throw new appError_1.InternalServerError("Unable to create post");
        }
    }
    static async getAllPosts(publishedOnly = true) {
        try {
            return await prisma.post.findMany({
                where: publishedOnly ? { isPublished: true } : undefined,
                include: {
                    author: { select: { id: true, fullName: true, email: true } },
                },
            });
        }
        catch (error) {
            console.log(error);
            if (error instanceof appError_1.AppError)
                throw error;
            throw new appError_1.InternalServerError("Unable to fetch posts");
        }
    }
    static async getPostById(postId) {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: {
                    author: {
                        select: { id: true, fullName: true, email: true }
                    },
                    comments: {
                        include: {
                            author: { select: { id: true, fullName: true, profileImage: true } }
                        }
                    },
                    likes: {
                        include: {
                            user: { select: { id: true, fullName: true, email: true } }
                        }
                    }
                },
            });
            if (!post)
                throw new appError_1.NotFoundError("Post not found");
            return post;
        }
        catch (error) {
            console.error("Error fetching post:", error);
            if (error instanceof appError_1.AppError)
                throw error;
            throw new appError_1.InternalServerError("Unable to fetch post");
        }
    }
    static async updatePost(postId, userId, updateData) {
        try {
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw new appError_1.NotFoundError("Post not found");
            if (post.authorId !== userId)
                throw new appError_1.UnAuthorizedError("Not authorized");
            return await prisma.post.update({
                where: { id: postId },
                data: updateData,
            });
        }
        catch (error) {
            console.log(error);
            if (error instanceof appError_1.AppError)
                throw error;
            throw new appError_1.InternalServerError("Unable to update post");
        }
    }
    static async deletePost(postId, userId) {
        try {
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw new appError_1.NotFoundError("Post not found");
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            if (user.role !== "ADMIN" && post.authorId !== userId) {
                throw new appError_1.ForbiddenError("Not authorized to delete this post");
            }
            await prisma.$transaction([
                prisma.comment.deleteMany({ where: { postId } }),
                prisma.like.deleteMany({ where: { postId } }),
                prisma.post.delete({ where: { id: postId } }),
            ]);
            return { message: "Post deleted successfully" };
        }
        catch (error) {
            console.error("Error deleting post:", error);
            if (error instanceof appError_1.AppError)
                throw error;
            throw new appError_1.InternalServerError("Unable to delete post");
        }
    }
}
exports.default = PostService;
