"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
// import { redisClient } from "../../config/redis";
const prisma = new client_1.PrismaClient();
class CommentService {
    async createComment(data) {
        const newComment = await prisma.comment.create({
            data,
            include: {
                author: { select: { fullName: true, profileImage: true } },
            },
        });
        // await redisClient.publish("new-comment", JSON.stringify(newComment));
        return newComment;
    }
    async getCommentsByPostId(postId, currentUserId) {
        try {
            if (!postId) {
                throw new appError_1.AppError("postId is required", 400);
            }
            // Check if post exists
            const postExists = await prisma.post.findUnique({
                where: { id: postId },
            });
            if (!postExists) {
                throw new appError_1.NotFoundError("Post not found");
            }
            // Fetch comments with likes, unlikes, and author
            const rawComments = await prisma.comment.findMany({
                where: { postId },
                select: {
                    id: true,
                    body: true,
                    createdAt: true,
                    authorId: true,
                    author: {
                        select: {
                            fullName: true,
                            profileImage: true,
                        },
                    },
                    likes: true,
                    unlikes: true,
                },
                orderBy: { createdAt: "desc" },
            });
            // Map and enrich comments
            const comments = rawComments.map((comment) => ({
                ...comment,
                numberOfLikes: comment.likes.length,
                numberOfUnlikes: comment.unlikes.length,
                isOwner: comment.authorId === currentUserId,
            }));
            return {
                comments,
                count: comments.length,
            };
        }
        catch (error) {
            if (error instanceof appError_1.AppError)
                throw error;
            throw new appError_1.AppError("Failed to fetch comments", 500);
        }
    }
    async updateComment(commentId, authorId, data) {
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true },
        });
        if (!existingComment) {
            throw new Error("Comment not found");
        }
        if (existingComment.authorId !== authorId) {
            throw new Error("Unauthorized: You can only update your own comment");
        }
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data,
            include: {
                author: { select: { fullName: true, profileImage: true } },
            },
        });
        // await redisClient.publish("new-comment", JSON.stringify(updatedComment));
        return updatedComment;
    }
    async getCommentById(commentId) {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });
        return comment;
    }
    async deleteComment(commentId) {
        const deletedComment = await prisma.comment.delete({
            where: { id: commentId },
        });
        return deletedComment;
    }
}
exports.CommentService = CommentService;
