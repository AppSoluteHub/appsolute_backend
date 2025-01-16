import { Request, Response } from "express";
import { CommentService } from "./comment.service";

const commentService = new CommentService();

export class CommentController {
  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { body } = req.body;
      const authorId = req.user as string;

      if (!body) {
        res.status(400).json({ error: "Comment body is required" });
        return;
      }

      const newComment = await commentService.createComment({
        body,
        postId,
        authorId,
      });

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  }

  async getCommentsByPostId(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const comments = await commentService.getCommentsByPostId(postId);
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { body } = req.body;
      const updatedComment = await commentService.updateComment(id, { body });
      res.status(200).json(updatedComment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await commentService.deleteComment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
}
