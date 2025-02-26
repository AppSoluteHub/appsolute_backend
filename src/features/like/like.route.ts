import { Router } from "express";
import { LikeController } from "./like.contoller";
import authenticate from "../../middlewares/auth.middleware"
const likeRouter = Router();
const likeController = new LikeController();

likeRouter.post("/:postId",authenticate,likeController.like); 
likeRouter.delete("/:postId",authenticate, likeController.unlike);

export default likeRouter;
