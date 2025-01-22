import { Request, Response } from "express";
import { AdminService } from "../services/manageUser.service";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; 

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

  // static async registerAdmin(req: Request, res: Response) {
  //   const { email, password } = req.body;

  //   try {
  //     // Hash password before saving
  //     const hashedPassword = await bcrypt.hash(password, 10);
  //     const newAdmin = await AdminService.registerAdmin(email, hashedPassword);
  //     res.status(201).json({
  //       success: true,
  //       message: "Admin registered successfully.",
  //       admin: newAdmin,
  //     });
  //   } catch (error) {
  //     res.status(400).json({ success: false, message: error });
  //   }
  // }

  // static async loginAdmin(req: Request, res: Response) {
  //   const { email, password } = req.body;

  //   try {
  //     const admin = await AdminService.findAdminByEmail(email);

  //     if (!admin) {
  //       return res.status(404).json({ success: false, message: "Admin not found." });
  //     }

  //     const isPasswordValid = await bcrypt.compare(password, admin.password);

  //     if (!isPasswordValid) {
  //       return res.status(401).json({ success: false, message: "Invalid credentials." });
  //     }

  //     // Generate JWT
  //     const token = jwt.sign({ id: admin._id, email: admin.email }, SECRET_KEY, { expiresIn: "1h" });

  //     res.status(200).json({
  //       success: true,
  //       message: "Admin logged in successfully.",
  //       token,
  //     });
  //   } catch (error) {
  //     res.status(400).json({ success: false, message: error });
  //   }
  // }
}
