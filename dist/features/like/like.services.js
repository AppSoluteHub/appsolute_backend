"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeService = void 0;
const appError_1 = require("../../lib/appError");
const prisma_1 = require("../../utils/prisma");
class LikeService {
    async toggleCommentLike(userId, commentId) {
        // Validate inputs
        if (!userId || !commentId) {
            throw new appError_1.BadRequestError("userId and commentId are required");
        }
        // Check if the comment exists
        const commentExists = await prisma_1.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!commentExists) {
            throw new appError_1.NotFoundError("Comment not found");
        }
        // Check for existing like
        const existingLike = await prisma_1.prisma.like.findUnique({
            where: {
                userId_commentId: { userId, commentId },
            },
        });
        if (!existingLike) {
            // Like the comment
            const newLike = await prisma_1.prisma.like.create({
                data: {
                    userId,
                    commentId,
                },
            });
            // Get updated like count
            const likeCount = await prisma_1.prisma.like.count({
                where: { commentId },
            });
            return {
                action: "liked",
                like: newLike,
                likeCount,
            };
        }
        else {
            // Unlike the comment
            await prisma_1.prisma.like.delete({
                where: {
                    userId_commentId: { userId, commentId },
                },
            });
            // Get updated like count
            const likeCount = await prisma_1.prisma.like.count({
                where: { commentId },
            });
            return {
                action: "unliked",
                message: "Like removed successfully",
                likeCount,
            };
        }
    }
    async toggleCommentUnLike(userId, commentId) {
        // Validate inputs
        if (!userId || !commentId) {
            throw new appError_1.BadRequestError("userId and commentId are required");
        }
        // Check if the comment exists
        const commentExists = await prisma_1.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!commentExists) {
            throw new appError_1.NotFoundError("Comment not found");
        }
        // Check for existing like
        const existingLike = await prisma_1.prisma.unlike.findUnique({
            where: {
                userId_commentId: { userId, commentId },
            },
        });
        if (!existingLike) {
            // Like the comment
            const newLike = await prisma_1.prisma.unlike.create({
                data: {
                    userId,
                    commentId,
                },
            });
            // Get updated like count
            const likeCount = await prisma_1.prisma.unlike.count({
                where: { commentId },
            });
            return {
                action: "unliked",
                like: newLike,
                likeCount,
            };
        }
        else {
            // Unlike the comment
            await prisma_1.prisma.unlike.delete({
                where: {
                    userId_commentId: { userId, commentId },
                },
            });
            // Get updated like count
            const likeCount = await prisma_1.prisma.unlike.count({
                where: { commentId },
            });
            return {
                action: "liked",
                message: "unLike removed successfully",
                likeCount,
            };
        }
    }
}
exports.LikeService = LikeService;
