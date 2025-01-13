import { Request, Router } from "express";
import PostController from "../controllers/blog.controller";
import authenticate from "../../../middlewares/auth.middleware";
import { validatePost } from "../../../validators/post.validator";
import multer from 'multer';



const router = Router();

const upload = multer();

router.post("/", authenticate, upload.single("file"), validatePost, PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.delete("/:id", authenticate, PostController.deletePost);
router.put("/:id", authenticate, PostController.updatePost);


export default router;
