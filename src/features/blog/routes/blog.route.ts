import { Request, Router } from "express";
import PostController from "../controllers/blog.controller";
import authenticate from "../../../middlewares/auth.middleware";
import { validatePost } from "../../../validators/post.validator";

const router = Router();


router.post("/", authenticate, PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);






// Update a post by ID (protected route)
// router.put("/:id", authenticate, PostController.updatePost);

// Delete a post by ID (protected route)
// router.delete("/:id", authenticate, PostController.deletePost);

export default router;
