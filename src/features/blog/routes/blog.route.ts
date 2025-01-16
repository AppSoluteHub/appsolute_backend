import { Request, Router } from "express";
import PostController from "../controllers/blog.controller";
import authenticate from "../../../middlewares/auth.middleware";
import { validatePost } from "../../../validators/post.validator";
import multer from 'multer';
import { CommentController } from "../../comments/comment.controller";
import { LikeController } from "../../like/like.contoller";

const commentController = new CommentController();
const likeController = new LikeController();


const router = Router();

const upload = multer();

router.post("/", authenticate, upload.single("file"), validatePost, PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.delete("/:id", authenticate, PostController.deletePost);
router.put("/:id", authenticate, PostController.updatePost);

router.post("/comments",authenticate, commentController.createComment);
router.get("/coments/:postId",authenticate, commentController.getCommentsByPostId);
router.put("/comments/:id",authenticate, commentController.updateComment);
router.delete("/comments/:id",authenticate, commentController.deleteComment);

router.post("/likes/:postId/like", likeController.like);
router.delete("/likes/:postId/like", likeController.unlike);






export default router;
