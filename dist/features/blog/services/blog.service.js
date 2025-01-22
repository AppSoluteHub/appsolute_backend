"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PostService {
    static async createPost(userId, postData) {
        const { title, imageUrl, description, category, contributors, isPublished } = postData;
        console.log(postData);
        const validCategory = category && Object.values(client_1.PostCategory).includes(category)
            ? category
            : client_1.PostCategory.TECHNOLOGY;
        try {
            const post = await prisma.post.create({
                data: {
                    title,
                    description,
                    category: validCategory,
                    authorId: userId,
                    imageUrl,
                    contributors,
                    isPublished,
                },
            });
            return post;
        }
        catch (error) {
            throw PostService.formatError(error);
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
            throw PostService.formatError(error);
        }
    }
    static async getPostById(postId) {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: {
                    author: { select: { id: true, fullName: true, email: true } },
                },
            });
            if (!post)
                throw { statusCode: 404, message: "Post not found" };
            return post;
        }
        catch (error) {
            throw PostService.formatError(error);
        }
    }
    static async updatePost(postId, userId, updateData) {
        try {
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw { statusCode: 404, message: "Post not found" };
            if (post.authorId !== userId)
                throw { statusCode: 403, message: "Not authorized to update this post" };
            return await prisma.post.update({
                where: { id: postId },
                data: updateData,
            });
        }
        catch (error) {
            throw PostService.formatError(error);
        }
    }
    static async deletePost(postId, userId) {
        try {
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post)
                throw { statusCode: 404, message: "Post not found" };
            if (post.authorId !== userId)
                throw { statusCode: 403, message: "Not authorized to delete this post" };
            await prisma.post.delete({ where: { id: postId } });
            return { message: "Post deleted successfully" };
        }
        catch (error) {
            throw PostService.formatError(error);
        }
    }
    static formatError(error) {
        if (error.statusCode && error.message)
            return error;
        return { statusCode: 500, message: "An unexpected error occurred" };
    }
}
exports.default = PostService;
