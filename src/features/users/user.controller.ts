import { Request, Response } from "express";
import { UserService } from "./user.service";
import { BadRequestError } from "../../lib/appError";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const users = await UserService.getUsers({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
      });

      res.status(200).json({
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await UserService.getUserById(userId);

      res.status(200).json({
        message: "User fetched successfully",
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await UserService.deleteUser(userId);

      res.status(200).json({
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updates = req.body
     
      const updatedUser = await UserService.updateUser(userId, updates);

      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
