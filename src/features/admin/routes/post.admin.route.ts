import express from "express";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import multer from "multer";
import PostController from "../controllers/post.admin.controller";
import { validateRequest } from "../../../middlewares/validateRequest";
import { validateFile } from "../../../middlewares/validateFile";
import { createPostSchema, updatePostSchema } from "../../../validators/post.validator";

const router = express.Router();

const upload = multer();

router.post(
  "/create",
  authenticate,
  isAdmin,
  upload.single("file"),
  validateFile,
  validateRequest(createPostSchema),
  PostController.createPost
);

router.get("/posts", PostController.getAllPosts);
router.get("/posts/:id", PostController.getPostById);
router.delete("/posts/:id", authenticate, isAdmin, PostController.deletePost);

router.patch(
  "/posts/:id",
  authenticate,
  isAdmin,
  upload.single("file"),
  validateFile,
  validateRequest(updatePostSchema),
  PostController.updatePost
);

export default router;



