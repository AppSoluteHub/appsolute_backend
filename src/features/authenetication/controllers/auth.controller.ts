import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import { generateRefreshToken, generateToken } from "../../../utils/jwt";

class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fullName, email, password ,profileImage} = req.body;
      const user = await AuthService.register({ fullName, email,profileImage, password});
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
      next(error);
      console.log(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user } = await AuthService.login(email, password);
      
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Login successful", token, user });
    } catch (error: any) {
      console.log(error);
      next(error);
    }
  }

  static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.status(200).json({ message: result });
    } catch (error: any) {
      next(error);
    }
  }

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const result = await AuthService.resetPassword(token, password);
      res.status(200).json({ message: result });
    } catch (error: any) {
      console.log(error);
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error("Token not provided");
      }
      const result = await AuthService.logout(token);
      res.status(200).json({ message: result });
    } catch (error: any) {
      next(error);
    }
  }
}

export default AuthController;
