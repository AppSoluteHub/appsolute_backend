import express  from "express";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import PostController from "../../blog/controllers/blog.controller";

const router = express.Router();
router.get("/",authenticate,isAdmin, PostController.getAllPosts);
router.get("/:id",authenticate,isAdmin, PostController.getPostById);
router.post("/",authenticate,isAdmin, PostController.createPost);
router.put("/:id",authenticate,isAdmin, PostController.updatePost);
router.delete("/:id",authenticate,isAdmin, PostController.deletePost);
export default router;