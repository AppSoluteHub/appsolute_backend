"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("./comment.service");
const commentService = new comment_service_1.CommentService();
class CommentController {
    async createComment(req, res) {
        console.log("here");
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
            const { postId } = req.params;
            const comments = await commentService.getCommentsByPostId(postId);
            res.status(200).json(comments);
        }
        catch (error) {
            // res.status(500).json({ error: "Failed to fetch comments" });
            console.log(error);
            next(error);
        }
    }
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { body } = req.body;
            console.log(body, "body");
            console.log(commentId, "commentId");
            const updatedComment = await commentService.updateComment(commentId, {
                body,
            });
            res.status(200).json(updatedComment);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to update comment" });
        }
    }
    async deleteComment(req, res) {
        try {
            const { id } = req.params;
            await commentService.deleteComment(id);
            res.status(204).send("Successfully deleted comment");
        }
        catch (error) {
            res.status(500).json({ error: "Failed to delete comment" });
        }
    }
}
exports.CommentController = CommentController;
