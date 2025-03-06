import express from 'express';
import authenticate, { isAdmin } from '../../../middlewares/auth.middleware';
import  {CommentController}  from '../../comments/comment.controller';
const commentController = new CommentController();
const commentRouter = express.Router();

commentRouter.post("/:postId",authenticate,isAdmin, commentController.createComment);
commentRouter.get("/:postId",authenticate,isAdmin, commentController.getCommentsByPostId);
commentRouter.put("/:commentId",authenticate,isAdmin ,commentController.updateComment);
commentRouter.delete("/:id",authenticate,isAdmin, commentController.deleteComment);

export default commentRouter;