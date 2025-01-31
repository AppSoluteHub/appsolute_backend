"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CommentService {
    async createComment(data) {
        return await prisma.comment.create({
            data,
        });
    }
    async getCommentsByPostId(postId) {
        return await prisma.comment.findMany({
            where: { postId },
            include: {
                author: { select: { fullName: true, profileImage: true } },
            },
        });
    }
    async updateComment(commentId, data) {
        return await prisma.comment.update({
            where: { id: commentId },
            data,
        });
    }
    async deleteComment(commentId) {
        return await prisma.comment.delete({
            where: { id: commentId },
        });
    }
}
exports.CommentService = CommentService;
