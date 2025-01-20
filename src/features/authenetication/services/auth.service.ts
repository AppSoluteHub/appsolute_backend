import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../utils/email";
import {
  BadRequestError,
  DuplicateError,
  InternalServerError,
  InvalidError,
  NotFoundError,
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
        data: { fullName, email, password: hashedPassword, profileImage },
      });
      return user;
    } catch (error: any) {
      throw new InternalServerError("Something went wrong");
    }
  }

  static async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password)))
        throw new InvalidError("Invalid Credentials");
         return {user} ;
    } catch (error: any) {
      console.error(error);
      throw new InternalServerError("Something went wrong");
    }
  }

  static async forgotPassword(email: string) {
    if (!email)  throw new BadRequestError("Email is required");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError("User not found")
    const otp = [...Array(6)].map(() => Math.floor(Math.random() * 10)).join("");
    const expiresIn = new Date();
    expiresIn.setMinutes(expiresIn.getMinutes() + 15); 
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: otp,
        resetTokenExpires: expiresIn,
      },
    });

    const emailTemplate = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <div style="background: #37459C; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">AppSolute</h1>
            <p style="margin: 5px 0; font-size: 16px;">Secure Your Account</p>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hello <strong style="color: #37459C;">${user.fullName}</strong>,</p>
            <p style="font-size: 14px; color: #555;">You recently requested to reset your password for your AppSolute account. Please use the OTP below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; background: #f9f9f9; border: 1px dashed #37459C; padding: 10px 20px; font-size: 24px; font-weight: bold; color: #333;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #555; margin-top: 20px;">This OTP is valid for <strong>15 minutes</strong>. If you did not request this reset, you can safely ignore this email.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="https://appsolute.com/support" style="text-decoration: none; background: #37459C; color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px;">Contact Support</a>
            </div>
          </div>
          <div style="background: #f9f9f9; padding: 10px 20px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 0;">If you have any questions, please contact us at <a href="mailto:support@appsolute.com" style="color: #4caf50;">support@appsolute.com</a>.</p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} AppSolute. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  
    const emailData: EmailData = {
      email: user.email,
      subject: "Reset your AppSolute password",
      html: emailTemplate
    };
    await sendEmail(emailData);
    return "OTP sent to your email";
  }
  
  static async resetPassword(otp: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: otp,
        resetTokenExpires: { gte: new Date() }, 
      },
    });
  
    if (!user) throw new InvalidError("Invalid or expired OTP");
    const hashedPassword = await bcrypt.hash(password, 10);
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
