"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_admin_service_1 = require("../services/comment.admin.service");
const appError_1 = require("../../../lib/appError");
const commentService = new comment_admin_service_1.CommentService();
class CommentController {
    async getCommentsByUserId(req, res, next) {
        try {
            const userId = req.params.userId;
            if (!userId) {
                throw new appError_1.BadRequestError("User ID is required");
            }
            const comments = await commentService.getCommentsByUserId(userId);
            res.status(200).json({
                success: true,
                message: "Comments fetched successfully",
                data: comments,
            });
        }
        catch (error) {
            next(error);
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
