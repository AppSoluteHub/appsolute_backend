import { Router } from "express";
import { CommentController } from "./comment.controller";
import authenticate from "../../middlewares/auth.middleware";

const commentRouter = Router();
const commentController = new CommentController();

commentRouter.post("/:postId",authenticate, commentController.createComment);
commentRouter.get("/:postId",authenticate, commentController.getCommentsByPostId);
commentRouter.put("/:commentId",authenticate, commentController.updateComment);
commentRouter.delete("/:id",authenticate, commentController.deleteComment);

export default commentRouter;
