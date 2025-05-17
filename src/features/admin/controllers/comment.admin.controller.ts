import { NextFunction, Request, Response } from "express";
import { CommentService } from "../services/comment.admin.service";
import { BadRequestError } from "../../../lib/appError";

const commentService = new CommentService();

export class CommentController {
 
 async getCommentsByUserId(
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> {
        try {
          const userId = req.params.userId;
      
          if (!userId) {
            throw new BadRequestError("User ID is required");
          }
      
          const comments = await commentService.getCommentsByUserId(userId);
      
          res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments,
          });
        } catch (error) {
          next(error);
        }
      }
      
  async getCommentsByPostId(req: Request, res: Response, next : NextFunction) {
    try {
      const { postId } = req.params;
      const comments = await commentService.getCommentsByPostId(postId);
      res.status(200).json(comments);
    } catch (error) {
      // res.status(500).json({ error: "Failed to fetch comments" });
      console.log(error);
      next(error);
    }
  }

  async updateComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { body } = req.body;
      console.log(body, "body");
      console.log(commentId, "commentId");
      const updatedComment = await commentService.updateComment(commentId, {
        body,
      });
      res.status(200).json(updatedComment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await commentService.deleteComment(id);
      res.status(204).send("Successfully deleted comment");
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
}
