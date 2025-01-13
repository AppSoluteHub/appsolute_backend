import { PrismaClient } from "@prisma/client";
import { RegisterInput } from "../../interfaces/auth.interfaces";
import {
  BadRequestError,
  DuplicateError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appError";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();


export class UserService {
  static async getUsers({
    page = 1,
    limit = 10,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const skip = (page - 1) * limit;

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
      });

      const totalUsers = await prisma.user.count({
        where: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      });

      return {
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new InternalServerError("Unable to fetch users");
    }
  }

  static async getUserById(userId: string) {
    try {
      if (!userId) throw new BadRequestError("User ID is required");

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
        },
      });

      if (!user) throw new NotFoundError("User not found");

      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new InternalServerError("Unable to fetch user");
    }
  }

  static async deleteUser(userId: string) {
    try {
      if (!userId) throw new BadRequestError("User ID is required");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("User not found");

      await prisma.user.delete({ where: { id: userId } });

      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new InternalServerError("Unable to delete user");
    }
  }

  static async updateUser(
    userId: string,
    updates: Partial<{
      fullName: string;
      email: string;
      profileImage: string;
      password: string;
    }>
  ) {
    try {
      if (!userId) throw new BadRequestError("User ID is required");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("User not found");

      const { fullName, email, profileImage, password } = updates;

      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.id !== userId) {
          throw new DuplicateError("Email already in use");
        }
        updateData.email = email;
      }
      if (profileImage) updateData.profileImage = profileImage;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new InternalServerError("Unable to update user");
    }
  }
}
