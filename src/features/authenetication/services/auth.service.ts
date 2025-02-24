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

static async register({
  fullName,
  profileImage,
  email,
  password,
}: RegisterInput) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new DuplicateError("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        fullName, 
        email, 
        password: hashedPassword, 
        profileImage: profileImage || ""  
      }
    });

    return user;
  } catch (error: any) {
    console.error("Error in AuthService.register:", error);
    if (error instanceof AppError) throw error; 
    throw new InternalServerError(error.message || "Something went wrong");
  }
}

  

  static async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if(!user) throw new UnAuthorizedError("Invalid credentials");
      const hashedPassword = await bcrypt.compare(password,user.password);
      if(!hashedPassword) throw new UnAuthorizedError("Invalid credentials");
      const {password: _, ...rest} = user;
      return {user} ;
    } catch (error: any) {
      console.error(error);
    if (error instanceof AppError) throw error; 
      throw new InternalServerError("Something went wrong");
    }
  }

 
  static async forgotPassword(email: string) {
    if (!email) throw new BadRequestError("Email is required");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = new Date();
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 15);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpires,
      },
    });

    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;

    const emailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background: #37459C; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">AppSolute</h1>
              <p style="margin: 5px 0; font-size: 16px;">Reset Your Password</p>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px; color: #333;">Hello <strong style="color: #37459C;">${user.fullName}</strong>,</p>
              <p style="font-size: 14px; color: #555;">You recently requested to reset your password for your AppSolute account. Click the button below to reset it:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="text-decoration: none; background: #37459C; color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px;">Reset Password</a>
              </div>
              <p style="font-size: 14px; color: #555;">If you did not request this reset, you can safely ignore this email.</p>
            </div>
            <div style="background: #f9f9f9; padding: 10px 20px; text-align: center; font-size: 12px; color: #888;">
              <p style="margin: 0;">If you have any questions, please contact us at <a href="mailto:support@appsolute.com" style="color: #4caf50;">support@appsolute.com</a>.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} AppSolute. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailData = {
      email: user.email,
      subject: "Reset your AppSolute password",
      html: emailTemplate,
    };
    
    await sendEmail(emailData);
    return "Password reset link sent to your email";
  }

  static async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    if (!token || !newPassword || !confirmPassword) throw new BadRequestError("All fields are required");
  if (newPassword !== confirmPassword) throw new BadRequestError("Passwords do not match");


  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    throw new BadRequestError(
      "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
    );
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
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return "Password reset successful";
  }
  static async logout(token: string) {
    try {
      if (!token) throw new BadRequestError("Authentication token is missing");
      return "Logout successful";
    } catch (error: any) {
      console.error(error);
    if (error instanceof AppError) throw error; 
      throw new InternalServerError("Something went wrong");
    }
  }

  static async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Unable to fetch user");
    }
  }
}

export default AuthService;
