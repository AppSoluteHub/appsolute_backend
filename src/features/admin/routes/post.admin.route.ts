import express from "express";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { validateLogin } from "../../../validators/userValidator";
import { validatePost } from "../../../validators/post.validator";
import PostController from "../../blog/controllers/blog.controller";
const router = express.Router();

router.post("/admin-post", authenticate, isAdmin, validatePost,PostController.createPost );
router.post("/admin-post", authenticate, isAdmin, validatePost,PostController.updatePost );
router.post("/admin-post", authenticate, isAdmin, validatePost,PostController.deletePost );
export default router;