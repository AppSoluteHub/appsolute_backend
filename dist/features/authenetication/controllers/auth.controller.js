"use strict";
// import { Request, Response, NextFunction } from "express";
// import AuthService from "../services/auth.service";
// import { generateRefreshToken, generateToken } from "../../../utils/jwt";
// import appResponse from "../../../lib/appResponse";
// import { BadRequestError } from "../../../lib/appError";
// class AuthController {
//   static async register(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { fullName, email, password, profileImage } = req.body;
//       const lowercaseEmail = email.toLowerCase();
//       const newUser = await AuthService.register({
//         fullName,
//         email,
//         profileImage,
//         password,
//       });
//       const { password: _, resetToken, resetTokenExpires, ...rest } = newUser;
//       res.status(201).json(appResponse("User registered successfully", rest));
//     } catch (error) {
//       console.error("Error in register controller:", error);
//       next(error);
//     }
//   }
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const jwt_1 = require("../../../utils/jwt");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.default.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== "string") {
                res.status(400).json({ message: "Invalid verification token" });
                return;
            }
            const result = await auth_service_1.default.verifyEmail(token);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async resendVerificationEmail(req, res, next) {
        try {
            const { email } = req.body;
            if (!email || typeof email !== "string") {
                res.status(400).json({ message: "Invalid email address" });
                return;
            }
            const result = await auth_service_1.default.resendVerificationEmail(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const lowercaseEmail = email.toLowerCase();
            const { user } = await auth_service_1.default.login(lowercaseEmail, password);
            const token = (0, jwt_1.generateToken)(user.id);
            const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
            res.setHeader("Authorization", `Bearer ${token}`);
            res.setHeader("x-refresh-token", refreshToken);
            res.status(200).json({
                message: "Login successful",
                user: user,
                token,
            });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.default.forgotPassword(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { token, newPassword, confirmPassword } = req.body;
            const result = await auth_service_1.default.resetPassword(token, newPassword, confirmPassword);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const { token } = req.body;
            const result = await auth_service_1.default.logout(token);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await auth_service_1.default.findById(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = AuthController;
