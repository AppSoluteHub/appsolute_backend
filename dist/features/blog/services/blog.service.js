"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PostService {
    static createPost(userId, postData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, imageUrl, description, category, isPublished } = postData;
            const validCategory = category && Object.values(client_1.PostCategory).includes(category)
                ? category
                : client_1.PostCategory.TECHNOLOGY;
            try {
                const post = yield prisma.post.create({
                    data: {
                        title,
                        description,
                        category: validCategory,
                        authorId: userId,
                        imageUrl,
                        isPublished,
                    },
                });
                return post;
            }
            catch (error) {
                throw PostService.formatError(error);
            }
        });
    }
    static getAllPosts() {
        return __awaiter(this, arguments, void 0, function* (publishedOnly = true) {
            try {
                return yield prisma.post.findMany({
                    where: publishedOnly ? { isPublished: true } : undefined,
                    include: {
                        author: { select: { id: true, fullName: true, email: true } },
                    },
                });
            }
            catch (error) {
                throw PostService.formatError(error);
            }
        });
    }
    static getPostById(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield prisma.post.findUnique({
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
        });
    }
    static updatePost(postId, userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield prisma.post.findUnique({ where: { id: postId } });
                if (!post)
                    throw { statusCode: 404, message: "Post not found" };
                if (post.authorId !== userId)
                    throw { statusCode: 403, message: "Not authorized to update this post" };
                return yield prisma.post.update({
                    where: { id: postId },
                    data: updateData,
                });
            }
            catch (error) {
                throw PostService.formatError(error);
            }
        });
    }
    static deletePost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield prisma.post.findUnique({ where: { id: postId } });
                if (!post)
                    throw { statusCode: 404, message: "Post not found" };
                if (post.authorId !== userId)
                    throw { statusCode: 403, message: "Not authorized to delete this post" };
                yield prisma.post.delete({ where: { id: postId } });
                return { message: "Post deleted successfully" };
            }
            catch (error) {
                throw PostService.formatError(error);
            }
        });
    }
    static formatError(error) {
        if (error.statusCode && error.message)
            return error;
        return { statusCode: 500, message: "An unexpected error occurred" };
    }
}
exports.default = PostService;
