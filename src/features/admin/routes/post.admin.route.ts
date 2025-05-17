import express from "express";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { validateUpdatePost } from "../../../validators/updatePost.validator";
import multer from "multer";
import PostController from "../controllers/post.admin.controller";

const router = express.Router();

const upload = multer();
router.post("/create", authenticate, isAdmin, upload.single("file"), PostController.createPost);
router.get("/posts", PostController.getAllPosts);
router.get("/posts/:id", PostController.getPostById);
router.delete("/posts/:id", authenticate, isAdmin, PostController.deletePost);
router.patch("/posts/:id", authenticate, validateUpdatePost, isAdmin, PostController.updatePost);


export default router;



