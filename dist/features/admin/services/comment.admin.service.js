"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
// import { redisClient } from "../../config/redis"; 
const prisma = new client_1.PrismaClient();
class CommentService {
    async getCommentsByPostId(postId) {
        try {
            const comments = await prisma.comment.findMany({
                where: { postId },
                select: {
                    body: true,
                    author: {
                        select: {
                            fullName: true,
                            profileImage: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            });
            if (comments.length === 0) {
                throw new appError_1.NotFoundError("No comments found for this post");
            }
            return comments;
        }
        catch (error) {
            if (error instanceof appError_1.AppError)
                throw error;
            throw new Error("Failed to fetch comments");
        }
    }
    async getCommentsByUserId(userId) {
        try {
            const comments = await prisma.comment.findMany({
                where: { authorId: userId },
                select: {
                    body: true,
                    author: {
                        select: {
                            fullName: true,
                            profileImage: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            });
            if (comments.length === 0) {
                throw new appError_1.NotFoundError("No comments found for this user");
            }
            return comments;
        }
        catch (error) {
            if (error instanceof appError_1.AppError)
                throw error;
            throw new Error("Failed to fetch comments");
        }
    }
    async updateComment(commentId, data) {
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
    async deleteComment(commentId) {
        const deletedComment = await prisma.comment.delete({
            where: { id: commentId },
        });
        // await redisClient.publish("delete-comment", JSON.stringify({ commentId }));
        return deletedComment;
    }
}
exports.CommentService = CommentService;
