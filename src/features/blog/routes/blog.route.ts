import { Request, Router } from "express";
import PostController from "../controllers/blog.controller";
import authenticate from "../../../middlewares/auth.middleware";
import { validatePost } from "../../../validators/post.validator";

const router = Router();

// Create a new post (protected route)
router.post("/", validatePost, authenticate, PostController.createPost);

// Get all posts (public route, optional filter for published posts)
router.get("/", PostController.getAllPosts);

// Get a single post by ID (public route)
router.get("/:id", PostController.getPostById);

// Update a post by ID (protected route)
// router.put("/:id", authenticate, PostController.updatePost);

// Delete a post by ID (protected route)
// router.delete("/:id", authenticate, PostController.deletePost);

export default router;
