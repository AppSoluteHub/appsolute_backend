"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("./comment.service");
const commentService = new comment_service_1.CommentService();
class CommentController {
    async createComment(req, res) {
        try {
            const { postId } = req.params;
            const { body } = req.body;
            const authorId = req.user?.id;
            if (!body) {
                res.status(400).json({ error: "Comment body is required" });
                return;
            }
            const urlRegex = /https?:\/\/[^\s]+/g;
            const repetitiveCharRegex = /(.)\1{4,}/;
            if (urlRegex.test(body) || repetitiveCharRegex.test(body)) {
                res.status(400).json({ error: "Spam content is not allowed" });
                return;
            }
            const newComment = await commentService.createComment({
                body,
                postId,
                authorId,
            });
            res.status(201).json(newComment);
        }
        catch (error) {
            console.error("Error creating comment:", error);
            res.status(500).json({ error: "Failed to create comment" });
        }
    }
    async getCommentsByPostId(req, res, next) {
        try {
            const currentUserId = req.user?.id;
            const { postId } = req.params;
            const comments = await commentService.getCommentsByPostId(postId, currentUserId);
            res.status(200).json(comments);
        }
        catch (error) {
            next(error);
        }
    }
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { body } = req.body;
            const authorId = req.user?.id;
            if (!body) {
                res.status(400).json({ error: "Comment body is required" });
                return;
            }
            const updatedComment = await commentService.updateComment(commentId, authorId, { body });
            res.status(200).json(updatedComment);
            return;
        }
        catch (error) {
            if (error.message === "Unauthorized: You can only update your own comment") {
                res.status(403).json({ error: error.message });
                return;
            }
            if (error.message === "Comment not found") {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: "Failed to update comment" });
            return;
        }
    }
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;
            if (!currentUser) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            // Fetch the comment first to check ownership
            const comment = await commentService.getCommentById(id);
            if (!comment) {
                res.status(404).json({ error: "Comment not found" });
                return;
            }
            // Check if current user is admin or owner of the comment
            if (currentUser.role !== "ADMIN" && comment.authorId !== currentUser.id) {
                res.status(403).json({ error: "Forbidden: You can only delete your own comments" });
                return;
            }
            await commentService.deleteComment(id);
            res.status(200).json("Successfully deleted comment");
        }
        catch (error) {
            res.status(500).json({ error: "Failed to delete comment" });
        }
    }
}
exports.CommentController = CommentController;
