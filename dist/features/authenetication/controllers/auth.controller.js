"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const jwt_1 = require("../../../utils/jwt");
const appResponse_1 = __importDefault(require("../../../lib/appResponse"));
const appError_1 = require("../../../lib/appError");
class AuthController {
    static async register(req, res, next) {
        try {
            const { fullName, email, password, profileImage } = req.body;
            const newUser = await auth_service_1.default.register({
                fullName,
                email,
                profileImage,
                password,
            });
            const { password: _, resetToken, resetTokenExpires, ...rest } = newUser;
            res.status(201).json((0, appResponse_1.default)("User registered successfully", rest));
        }
        catch (error) {
            console.error("Error in register controller:", error);
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user } = await auth_service_1.default.login(email, password);
            const token = (0, jwt_1.generateToken)(user.id);
            const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
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
            const { password: _, resetToken, resetTokenExpires, ...rest } = user;
            res.status(200).json({ message: "Login successful", token, rest });
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
            res.send((0, appResponse_1.default)("Message:", result));
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { password, confirmPassword, token } = req.body;
            if (!token || !password || !confirmPassword)
                throw new appError_1.BadRequestError("OTP, password, and confirm password are required");
            if (password !== confirmPassword)
                throw new appError_1.BadRequestError("Password and confirm password do not match");
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                throw new appError_1.BadRequestError("Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character");
            }
            const result = await auth_service_1.default.resetPassword(token, password, confirmPassword);
            res.send((0, appResponse_1.default)("Password reset successful", result));
        }
        catch (error) {
            console.error("Reset password error:", error);
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const token = req.cookies?.token;
            if (!token)
                throw new Error("Token not provided");
            const result = await auth_service_1.default.logout(token);
            res.clearCookie("token", { httpOnly: true, secure: true });
            res.send((0, appResponse_1.default)("Message:", result));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = AuthController;
