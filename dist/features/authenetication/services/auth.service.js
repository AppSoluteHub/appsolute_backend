"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const email_1 = require("../../../utils/email");
const appError_1 = require("../../../lib/appError");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
class AuthService {
    static async register({ fullName, profileImage, email, password, }) {
        try {
            const lowercaseEmail = email.toLowerCase();
            const existingUser = await prisma.user.findUnique({
                where: { email: lowercaseEmail },
            });
            if (existingUser && existingUser.verified) {
                // Case 1: Already exists and verified
                throw new appError_1.DuplicateError("User with this email already exists and is verified.");
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
            const verificationTokenHash = await bcryptjs_1.default.hash(verificationToken, 10);
            let user;
            if (existingUser && !existingUser.verified) {
                // Case 2: User exists but not verified → update existing user
                user = await prisma.user.update({
                    where: { email: lowercaseEmail },
                    data: {
                        fullName,
                        password: hashedPassword,
                        profileImage: profileImage ||
                            "https://png.pngtree.com/png-clipart/20200224/original/pngtree-cartoon-color-simple-male-avatar-png-image_5230557.jpg",
                        resetToken: verificationTokenHash,
                        resetTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                });
            }
            else {
                // Case 3: New user → create
                user = await prisma.user.create({
                    data: {
                        fullName,
                        email: lowercaseEmail,
                        password: hashedPassword,
                        profileImage: profileImage ||
                            "https://png.pngtree.com/png-clipart/20200224/original/pngtree-cartoon-color-simple-male-avatar-png-image_5230557.jpg",
                        resetToken: verificationTokenHash,
                        resetTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        verified: false,
                    },
                });
            }
            const verifyLink = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}`;
            const emailTemplate = `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <div style="background: #37459C; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">AppSolute</h1>
            <p style="margin: 5px 0; font-size: 16px;">Verify Your Email</p>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hello <strong style="color: #37459C;">${fullName}</strong>,</p>
            <p style="font-size: 14px; color: #555;">Thank you for signing up! Please click the button below to verify your email and activate your account:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verifyLink}" style="text-decoration: none; background: #37459C; color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px;">Verify Email</a>
            </div>
            <p style="font-size: 14px; color: #555;">If you did not create this account, you can safely ignore this email.</p>
          </div>
          <div style="background: #f9f9f9; padding: 10px 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">If you have any questions, please contact us at <a href="mailto:support@appsolute.com" style="color: #4caf50;">support@appsolutehub.com</a>.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} AppSolute. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;
            await (0, email_1.sendEmail)({
                email: user.email,
                subject: "Verify Your Email - AppSolute",
                html: emailTemplate,
            });
            return {
                message: "Registration successful. Please check your email to verify your account.",
            };
        }
        catch (error) {
            console.error("Error in AuthService.register:", error);
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new appError_1.BadRequestError("Email already exists.");
                }
            }
            if (error instanceof appError_1.AppError)
                throw error;
            throw new Error("Something went wrong during registration.");
        }
    }
    static async verifyEmail(token) {
        if (!token)
            throw new appError_1.BadRequestError("Verification token is required.");
        try {
            const user = await prisma.user.findFirst({
                where: {
                    resetTokenExpires: {
                        gte: new Date(),
                    },
                    resetToken: {
                        not: null,
                    },
                },
            });
            if (!user)
                throw new appError_1.InvalidError("Invalid or expired verification token.");
            const isTokenValid = await bcryptjs_1.default.compare(token, user.resetToken);
            if (!isTokenValid) {
                if (!user.verified) {
                    await prisma.user.delete({ where: { id: user.id } });
                }
                throw new appError_1.InvalidError("Verification token is incorrect or expired , please register again.");
            }
            if (user.verified) {
                throw new appError_1.BadRequestError("This account is already verified.");
            }
            // Everything checks out, verify the user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verified: true,
                    resetToken: null,
                    resetTokenExpires: null,
                },
            });
            return { message: "Email verified successfully." };
        }
        catch (error) {
            if (error.code === "P2025") {
                throw new appError_1.NotFoundError("User not found.");
            }
            if (error instanceof appError_1.BadRequestError || error instanceof appError_1.InvalidError || error instanceof appError_1.NotFoundError) {
                throw error;
            }
            console.error("Error in verifyEmail:", error);
            throw new Error("Something went wrong while verifying your email.");
        }
    }
    static async resendVerificationEmail(email) {
        if (!email)
            throw new appError_1.BadRequestError("Email is required");
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new appError_1.NotFoundError("User not found");
        if (user.verified)
            throw new appError_1.BadRequestError("User is already verified");
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const verificationTokenHash = await bcryptjs_1.default.hash(verificationToken, 10);
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: verificationTokenHash,
                resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
            },
        });
        const verifyLink = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}`;
        const emailTemplate = `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <div style="background: #37459C; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">AppSolute</h1>
            <p style="margin: 5px 0; font-size: 16px;">Verify Your Email</p>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hello <strong style="color: #37459C;">${user.fullName}</strong>,</p>
            <p style="font-size: 14px; color: #555;">You requested a new email verification link. Click below to verify your email:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verifyLink}" style="text-decoration: none; background: #37459C; color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px;">Verify Email</a>
            </div>
            <p style="font-size: 14px; color: #555;">If you did not request this, you can safely ignore this email.</p>
          </div>
          <div style="background: #f9f9f9; padding: 10px 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">If you have any questions, please contact us at <a href="mailto:support@appsolute.com" style="color: #4caf50;">support@appsolute.com</a>.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} AppSolute. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: "Resend Verification Email - AppSolute",
            html: emailTemplate,
        });
        return { message: "Verification email resent successfully" };
    }
    static async login(email, password) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user)
                throw new appError_1.UnAuthorizedError("Invalid credentials");
            // if (!user.verified)
            //   throw new UnAuthorizedError(
            //     "Email not verified. Please check your email."
            //   );
            const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatch)
                throw new appError_1.UnAuthorizedError("Invalid credentials");
            const { password: _, resetToken, resetTokenExpires, ...rest } = user;
            return { user: rest };
        }
        catch (error) {
            console.error("Error in AuthService.login:", error);
            throw error instanceof appError_1.AppError
                ? error
                : new appError_1.InternalServerError("Something went wrong during login.");
        }
    }
    static async forgotPassword(email) {
        if (!email)
            throw new appError_1.BadRequestError("Email is required");
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            throw new appError_1.NotFoundError("User not found");
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenHash = await bcryptjs_1.default.hash(resetToken, 10);
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.user.update({
            where: { email },
            data: { resetToken: resetTokenHash, resetTokenExpires },
        });
        const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
        const emailTemplate = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: "Reset Your Password",
            html: emailTemplate,
        });
        return { message: "Password reset link sent to your email" };
    }
    static async resetPassword(token, newPassword, confirmPassword) {
        if (!token || !newPassword || !confirmPassword)
            throw new appError_1.BadRequestError("All fields are required");
        if (newPassword !== confirmPassword)
            throw new appError_1.BadRequestError("Passwords do not match");
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new appError_1.BadRequestError("Password must be at least 8 characters long, with an uppercase letter, a lowercase letter, a number, and a special character.");
        }
        const user = await prisma.user.findFirst({
            where: { resetTokenExpires: { gte: new Date() } },
        });
        if (!user || !(await bcryptjs_1.default.compare(token, user.resetToken))) {
            throw new appError_1.InvalidError("Invalid or expired token");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null,
            },
        });
        return { message: "Password reset successful" };
    }
    static async logout(token) {
        try {
            if (!token)
                throw new appError_1.BadRequestError("Authentication token is missing");
            return { message: "Logout successful" };
        }
        catch (error) {
            console.error("Error in AuthService.logout:", error);
            throw error instanceof appError_1.AppError
                ? error
                : new appError_1.InternalServerError("Something went wrong.");
        }
    }
    static async findById(id) {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            return user;
        }
        catch (error) {
            console.error("Error fetching user by ID:", error);
            throw new appError_1.InternalServerError("Unable to fetch user");
        }
    }
}
exports.default = AuthService;
