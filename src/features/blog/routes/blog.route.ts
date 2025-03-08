import { Request, Router } from "express";
import PostController from "../controllers/blog.controller";
import authenticate from "../../../middlewares/auth.middleware";
import { validatePost } from "../../../validators/post.validator";
import multer from 'multer';
import { CommentController } from "../../comments/comment.controller";
import { LikeController } from "../../like/like.contoller";
import { validateUpdatePost } from "../../../validators/updatePost.validator";

const commentController = new CommentController();
const likeController = new LikeController();


const router = Router();

const upload = multer();

router.post("/", authenticate, upload.single("file"), PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.delete("/:id", authenticate, PostController.deletePost);
router.patch("/:id", authenticate, validateUpdatePost, PostController.updatePost);

router.post("/:postId/comment",authenticate, commentController.createComment);
router.get("/:postId/comment",authenticate, commentController.getCommentsByPostId);
router.put("/:postId/comment",authenticate, commentController.updateComment);
router.delete("/:postId/comment",authenticate, commentController.deleteComment);

router.post("/:postId/like",authenticate, likeController.like);
router.delete("/:postId/unlike", authenticate,likeController.unlike);


export default router;
