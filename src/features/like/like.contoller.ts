import { Request, Response } from "express";
import { LikeService } from "./like.services";

export class LikeController {
  private likeService: LikeService;

  constructor() {
    this.likeService = new LikeService();
  }

  async like(req: Request, res: Response) {
    try {
      const userId = req.user.id; 
      const { postId } = req.params; 

      const newLike = await this.likeService.likePost(userId, postId);
      res.status(201).json(newLike); 
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ error: "Failed to like post" });
    }
  }

 
  async unlike(req: Request, res: Response) {
    try {
      const userId = req.user.id; 
      const { postId } = req.params; 

      const response = await this.likeService.unlikePost(userId, postId);
      res.status(200).json(response); 
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ error: "Failed to unlike post" });
    }
  }
}
