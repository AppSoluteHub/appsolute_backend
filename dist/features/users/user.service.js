"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma_1 = require("../../utils/prisma");
class UserService {
    static async getUsers({ page = 1, limit = 10, search = "", }) {
        try {
            const skip = (page - 1) * limit;
            const users = await prisma_1.prisma.user.findMany({
                where: {
                    OR: [
                        { fullName: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                },
                skip,
                take: limit,
            });
            const totalUsers = await prisma_1.prisma.user.count({
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
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw new appError_1.InternalServerError(`Unable to fetch users ${error.message}`);
        }
    }
    static async getAdmins({ search = "" }) {
        try {
            const admins = await prisma_1.prisma.user.findMany({
                where: {
                    role: {
                        in: ["ADMIN", "SUPERADMIN"],
                    },
                    OR: [
                        { fullName: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                },
            });
            return admins;
        }
        catch (error) {
            console.error("Error fetching admins:", error);
            throw new appError_1.InternalServerError(`Unable to fetch admins ${error.message}`);
        }
    }
    static async getRoles({ search = "" }) {
        try {
            const admins = await prisma_1.prisma.user.findMany({
                where: {
                    role: {
                        in: ["ADMIN", "SUPERADMIN", "GUEST", "EDITOR", "CONTRIBUTOR"],
                    },
                    OR: [
                        { fullName: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                },
            });
            return admins;
        }
        catch (error) {
            console.error("Error fetching admins:", error);
            throw new appError_1.InternalServerError(`Unable to fetch admins ${error.message}`);
        }
    }
    // static async getUserById(userId: string) {
    //   if (!userId) {
    //     throw new BadRequestError("User ID is required");
    //   }
    //   try {
    //     const user = await prisma.user.findUnique({
    //       where: { id: userId },
    //       select: {
    //         id: true,
    //         fullName: true,
    //         nickName: true,
    //         country: true,
    //         phone: true,
    //         gender: true,
    //         email: true,
    //         profileImage: true,
    //         role: true,
    //         totalScore: true,
    //         answered: true,
    //       },
    //     });
    //     if (!user) {
    //       throw new NotFoundError("User not found");
    //     }
    //     return user;
    //   } catch (error : any) {
    //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //       console.error("Prisma known error:", error.message);
    //       throw new Error("Invalid request to the database");
    //     }
    //     if (error instanceof Prisma.PrismaClientValidationError) {
    //       console.error("Prisma validation error:", error.message);
    //       throw new Error("Invalid input for database query");
    //     }
    //     console.error("Unexpected error fetching user by ID:", error.message);
    //     throw new InternalServerError(`Error feching user :${error.message}`);
    //   }
    // }
    static async getUserById(userId) {
        if (!userId) {
            throw new appError_1.BadRequestError("User ID is required");
        }
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new appError_1.NotFoundError("User not found");
            }
            const { password: _, ...rest } = user;
            return rest;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                console.error("Prisma known error:", error.message);
                throw new Error("Invalid request to the database");
            }
            if (error instanceof client_1.Prisma.PrismaClientValidationError) {
                console.error("Prisma validation error:", error.message);
                throw new Error("Invalid input for database query");
            }
            console.error("Unexpected error fetching user by ID:", error.message);
            throw new appError_1.InternalServerError(`Error fetching user: ${error.message}`);
        }
    }
    static async deleteUser(userId) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            await prisma_1.prisma.user.delete({ where: { id: userId } });
            return { message: "User deleted successfully" };
        }
        catch (error) {
            console.error("Error deleting user:", error);
            throw new appError_1.InternalServerError(`error deleting user: ${error.message}`);
        }
    }
    static async updateUser(userId, updates) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            const { fullName, email, role, gender, country, phone, nickName } = updates;
            const updateData = {};
            if (fullName)
                updateData.fullName = fullName;
            if (email) {
                const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
                if (existingUser && existingUser.id !== userId) {
                    throw new appError_1.DuplicateError("Email already in use");
                }
                updateData.email = email;
            }
            if (role) {
                const validRoles = ["GUEST", "ADMIN", "SUPERADMIN"];
                if (!validRoles.includes(role)) {
                    throw new appError_1.BadRequestError("Invalid role");
                }
                updateData.role = role;
            }
            if (gender !== undefined)
                updateData.gender = gender;
            if (country !== undefined)
                updateData.country = country;
            if (phone !== undefined)
                updateData.phone = phone;
            if (nickName !== undefined)
                updateData.nickName = nickName;
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    fullName: true,
                    gender: true,
                    country: true,
                    nickName: true,
                    phone: true,
                    email: true,
                    role: true,
                    joined: true,
                    profileImage: true,
                    updatedAt: true,
                },
            });
            return updatedUser;
        }
        catch (error) {
            console.error("Error updating user:", error);
            throw new appError_1.InternalServerError(`Unable to update user: ${error.message}`);
        }
    }
    static async updateUserRole(email, fullName, updates) {
        const data = {};
        if (updates.role) {
            data.role = updates.role;
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        if (!existingUser) {
            throw new appError_1.NotFoundError("User not found");
        }
        const existUserId = existingUser?.id;
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: existUserId },
            data,
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        return updatedUser;
    }
    static async updateProfileImage(userId, imageUrl) {
        return await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
        });
    }
}
exports.UserService = UserService;
