"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma = new client_1.PrismaClient();
class LikeService {
    async likePost(userId, postId) {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId },
            },
        });
        if (existingLike) {
            throw new appError_1.DuplicateError("You have already liked this post.");
        }
        const newLike = await prisma.like.create({
            data: {
                userId,
                postId,
            },
        });
        return newLike;
    }
    async unlikePost(userId, postId) {
        // Check if the like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId },
            },
        });
        if (!existingLike) {
            throw new appError_1.BadRequestError("You have not liked this post yet.");
        }
        // Delete the like
        await prisma.like.delete({
            where: {
                userId_postId: { userId, postId },
            },
        });
        return { message: "Like removed successfully." };
    }
}
exports.LikeService = LikeService;
