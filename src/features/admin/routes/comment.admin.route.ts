import expres from "express";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { CommentController } from "../controllers/comment.admin.controller";
const commentController = new CommentController();

const router = expres.Router();

router.delete("/delete/postId", authenticate, isAdmin, commentController.deleteComment); 
router.get("/comment/postId", authenticate, isAdmin, commentController.getCommentsByPostId); 
router.get("/comment/userId", authenticate, isAdmin,commentController.getCommentsByUserId); 
router.patch("/comment/commentId", authenticate, isAdmin, commentController.updateComment); 

export default router; 