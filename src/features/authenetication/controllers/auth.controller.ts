

import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import { generateRefreshToken, generateToken } from "../../../utils/jwt";

class AuthController {

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }


  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      console.log(token);
      if (!token || typeof token !== "string") {
         res.status(400).json({ message: "Invalid verification token" });
         return;
      }

      const result = await AuthService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const result = await AuthService.resendVerificationEmail(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const lowercaseEmail = email.toLowerCase();
      const { user } = await AuthService.login(lowercaseEmail, password);
  
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
  
     
      res.setHeader("Authorization", `Bearer ${token}`);
      res.setHeader("x-refresh-token", refreshToken);
      
      res.status(200).json({
        message: "Login successful",
        user: user,
        token, 
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
 
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword, confirmPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

 
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await AuthService.logout(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AuthService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
