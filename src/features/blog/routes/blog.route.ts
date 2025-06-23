import { Request, Router } from "express";
import PostController from "../controllers/blog.controller";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { validatePost } from "../../../validators/post.validator";
import multer from 'multer';
import { CommentController } from "../../comments/comment.controller";
import { validateUpdatePost } from "../../../validators/updatePost.validator";
import { ImageController } from "../controllers/imageUpload";

const commentController = new CommentController();


const router = Router();

const upload = multer();
router.post("/image-upload", authenticate, upload.single("file"), ImageController.uploadImage);
router.post("/", authenticate,isAdmin, upload.single("file"), PostController.createPost);
router.get("/", PostController.getAllPosts);

router.get("/:postId", PostController.getPostById);
router.delete("/:postId", authenticate, PostController.deletePost);
router.patch("/:postId",authenticate, isAdmin, upload.single("file"), PostController.updatePost);


router.post("/:postId/comment",authenticate, commentController.createComment);
router.get("/:postId/comment",authenticate, commentController.getCommentsByPostId);
router.put("/:postId/comment",authenticate, commentController.updateComment);
router.delete("/:postId/comment",authenticate, commentController.deleteComment);



export default router;
