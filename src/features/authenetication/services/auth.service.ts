import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../utils/email";
import { generateToken } from "../../../utils/jwt";

const prisma = new PrismaClient();

class AuthService {
  /**
   * Register a new user
   */
  static async register({ fullName,profileImage, email, password }: { fullName: string;profileImage:string, email: string; password: string; }) {
    try {
      if (!fullName || !email || !password) {
        throw { statusCode: 400, message: "All fields are required" };
      }

      // Check for existing user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw { statusCode: 409, message: "Email already exists" };
      }

      // Hash the password and create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { fullName, email, password: hashedPassword ,profileImage},
      });

      return user;
    } catch (error: any) {
      throw AuthService.formatError(error);
    }
  }

  /**
   * User login
   */
  static async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw { statusCode: 400, message: "Email and password are required" };
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw { statusCode: 401, message: "Invalid credentials" };
      }


      return {  user };
    } catch (error: any) {
      throw AuthService.formatError(error);
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string) {
    try {
      if (!email) {
        throw { statusCode: 400, message: "Email is required" };
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw { statusCode: 404, message: "User not found" };
      }
      const token = [...Array(6)].map(() => Math.floor(Math.random() * 10)).join('');
      const resetToken = generateToken(user.id);
      const resetLink = `TOKEN=${token}`;
      const emailData = {
        email: user.email,
        subject: "Reset your AppSolute password",
        html: `
          <html>
            <body>
              <p>Hello ${user.email},</p>
              <p>To reset your password, use the token below:</p>
              <p>${resetLink}</p>
              <p>This token is valid for 1 hour.</p>
            </body>
          </html>
        `,
      };
      await sendEmail(emailData);

      return "Password reset link sent";
    } catch (error: any) {
      throw AuthService.formatError(error);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, password: string) {
    try {
      if (!token || !password) {
        throw { statusCode: 400, message: "Token and password are required" };
      }

      const { id }: any = jwt.verify(token, process.env.JWT_SECRET!);
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({ where: { id }, data: { password: hashedPassword } });

      return "Password reset successful";
    } catch (error: any) {
      console.log(error);
      if (error.name === "JsonWebTokenError") {
        throw { statusCode: 401, message: "Invalid or expired token" };
      }
      throw AuthService.formatError(error);
    }
  }

  /**
   * Logout
   */
  static async logout(token: string) {
    try {
      if (!token) {
        throw { statusCode: 400, message: "Token is required for logout" };
      }

      // Add token invalidation logic (e.g., store in blacklist)
      return "Logout successful";
    } catch (error: any) {
      throw AuthService.formatError(error);
    }
  }

 static async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }, 
      });
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Unable to fetch user");
    }
  }

  /**
   * Format and normalize errors
   */
  private static formatError(error: any) {
    if (error.statusCode && error.message) {
      return error;
    }

    console.error("Unexpected error:", error); 
    return { statusCode: 500, message: "An unexpected error occurred" };
  }
}

export default AuthService;
