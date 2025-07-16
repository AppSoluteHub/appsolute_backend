"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCommentUnLike = exports.toggleCommentLike = void 0;
const like_services_1 = require("./like.services");
const zod_1 = require("zod");
const appError_1 = require("../../lib/appError");
// Input validation schema
const toggleLikeSchema = zod_1.z.object({
    commentId: zod_1.z.string().uuid('Invalid comment ID'),
});
// Instantiate service
const likeService = new like_services_1.LikeService();
const toggleCommentLike = async (req, res, next) => {
    try {
        // Get userId from authenticated user
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.BadRequestError('Unauthorized: User not authenticated');
        }
        // Validate commentId
        const { commentId } = toggleLikeSchema.parse({
            commentId: req.params.commentId,
        });
        // Call service method
        const result = await likeService.toggleCommentLike(userId, commentId);
        // Return response
        res.status(result.action === 'liked' ? 201 : 200).json({
            status: 'success',
            data: {
                action: result.action,
                like: result.like || null,
                likeCount: result.likeCount,
                message: result.message || null,
            },
        });
    }
    catch (error) {
        // Handle specific errors
        if (error instanceof appError_1.BadRequestError) {
            res.status(400).json({
                status: 'error',
                message: error.message,
            });
            return;
        }
        if (error instanceof appError_1.NotFoundError) {
            res.status(404).json({
                status: 'error',
                message: error.message,
            });
            return;
        }
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }
        next(error);
    }
};
exports.toggleCommentLike = toggleCommentLike;
const toggleCommentUnLike = async (req, res, next) => {
    try {
        // Get userId from authenticated user
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.BadRequestError('Unauthorized: User not authenticated');
        }
        // Validate commentId
        const { commentId } = toggleLikeSchema.parse({
            commentId: req.params.commentId,
        });
        // Call service method
        const result = await likeService.toggleCommentUnLike(userId, commentId);
        // Return response
        res.status(result.action === 'liked' ? 201 : 200).json({
            status: 'success',
            data: {
                action: result.action,
                like: result.like || null,
                likeCount: result.likeCount,
                message: result.message || null,
            },
        });
    }
    catch (error) {
        // Handle specific errors
        if (error instanceof appError_1.BadRequestError) {
            res.status(400).json({
                status: 'error',
                message: error.message,
            });
            return;
        }
        if (error instanceof appError_1.NotFoundError) {
            res.status(404).json({
                status: 'error',
                message: error.message,
            });
            return;
        }
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }
        next(error);
    }
};
exports.toggleCommentUnLike = toggleCommentUnLike;
