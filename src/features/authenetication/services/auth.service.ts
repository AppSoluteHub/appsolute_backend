
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../utils/email";
import {
  AppError,
  BadRequestError,
  DuplicateError,
  InternalServerError,
  InvalidError,
  NotFoundError,
  UnAuthorizedError,
} from "../../../lib/appError";
import { RegisterInput, EmailData } from "../../../interfaces/auth.interfaces";

const prisma = new PrismaClient();

class AuthService {
 
  static async register({ fullName, profileImage, email, password }: RegisterInput) {
    try {
      const lowercaseEmail = email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email: lowercaseEmail } });
      if (existingUser) throw new DuplicateError("Email already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenHash = await bcrypt.hash(verificationToken, 10);


      const user = await prisma.user.create({
        data: {
          fullName,
          email: lowercaseEmail,
          password: hashedPassword,
          profileImage: profileImage || "https://png.pngtree.com/png-clipart/20200224/original/pngtree-cartoon-color-simple-male-avatar-png-image_5230557.jpg",
          resetToken: verificationTokenHash, 
          resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000), 
          verified: false, 
        },
      });

    
      const verifyLink = `https://appsolutehub.vercel.app/verify-email?token=${verificationToken}`;

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
          <p style="margin: 0;">If you have any questions, please contact us at <a href="mailto:support@appsolute.com" style="color: #4caf50;">support@appsolute.com</a>.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} AppSolute. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;


      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - AppSolute",
        html: emailTemplate,
      });

      return { message: "User registered successfully. Please check your email to verify your account." };
    } catch (error: any) {
      console.error("Error in AuthService.register:", error);
      throw error instanceof AppError ? error : new InternalServerError("Something went wrong during registration.");
    }
  }

  
  static async verifyEmail(token: string) {
    if (!token) throw new BadRequestError("Verification token is required");

    const user = await prisma.user.findFirst({
      where: { resetTokenExpires: { gte: new Date() } },
    });

    if (!user || !(await bcrypt.compare(token, user.resetToken!))) {
      throw new InvalidError("Invalid or expired verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, resetTokenExpires: null, verified: true },
    });

    return { message: "Email verified successfully" };
  }

 
  static async resendVerificationEmail(email: string) {
    if (!email) throw new BadRequestError("Email is required");
  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found");
    if (user.verified) throw new BadRequestError("User is already verified");
  
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = await bcrypt.hash(verificationToken, 10);
  
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: verificationTokenHash,
        resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000), 
      },
    });
  
    const verifyLink = `https://appsolutehub.vercel.app/verify-email?token=${verificationToken}`;
    
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
  
    await sendEmail({
      email: user.email,
      subject: "Resend Verification Email - AppSolute",
      html: emailTemplate,
    });
  
    return { message: "Verification email resent successfully" };
  
  }
  static async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) throw new UnAuthorizedError("Invalid credentials");
  
      if (!user.verified) throw new UnAuthorizedError("Email not verified. Please check your email.");
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) throw new UnAuthorizedError("Invalid credentials");
  
      const { password: _, resetToken, resetTokenExpires, ...rest } = user;
      return { user: rest };
    } catch (error: any) {
      console.error("Error in AuthService.login:", error);
      throw error instanceof AppError ? error : new InternalServerError("Something went wrong during login.");
    }
  }
  

 
  static async forgotPassword(email: string) {
    if (!email) throw new BadRequestError("Email is required");

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new NotFoundError("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); 

    await prisma.user.update({
      where: { email },
      data: { resetToken: resetTokenHash, resetTokenExpires },
    });

    const resetLink = `https://appsolutehub.vercel.app/reset-password?token=${resetToken}`;
    const emailTemplate = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

    await sendEmail({ email: user.email, subject: "Reset Your Password", html: emailTemplate });

    return { message: "Password reset link sent to your email" };
  }

 


  static async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    if (!token || !newPassword || !confirmPassword) throw new BadRequestError("All fields are required");
    if (newPassword !== confirmPassword) throw new BadRequestError("Passwords do not match");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestError("Password must be at least 8 characters long, with an uppercase letter, a lowercase letter, a number, and a special character.");
    }

    const user = await prisma.user.findFirst({
      where: { resetTokenExpires: { gte: new Date() } },
    });

    if (!user || !(await bcrypt.compare(token, user.resetToken!))) {
      throw new InvalidError("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpires: null },
    });

    return { message: "Password reset successful" };
  }

  
  static async logout(token: string) {
    try {
      if (!token) throw new BadRequestError("Authentication token is missing");
      return { message: "Logout successful" };
    } catch (error: any) {
      console.error("Error in AuthService.logout:", error);
      throw error instanceof AppError ? error : new InternalServerError("Something went wrong.");
    }
  }

  
  static async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundError("User not found");
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new InternalServerError("Unable to fetch user");
    }
  }
}

export default AuthService;
