import { Request, Response } from "express";
import { AdminService } from "../services/manageUser.service";

export class AdminController {
  static async addAdmin(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const updatedUser = await AdminService.addAdmin(email);
      res.status(200).json({
        success: true,
        message: "User promoted to admin.",
        user: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error });
    }
  }

  static async removeAdmin(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const updatedUser = await AdminService.removeAdmin(email);
      res.status(200).json({
        success: true,
        message: "User demoted from admin.",
        user: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error });
    }
  }
}
