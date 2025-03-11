"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma = new client_1.PrismaClient();
class UserService {
    static async getUsers({ page = 1, limit = 10, search = "", }) {
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
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw new appError_1.InternalServerError("Unable to fetch users");
        }
    }
    static async getAdmins({ search = "" }) {
        try {
            const admins = await prisma.user.findMany({
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
            throw new appError_1.InternalServerError("Unable to fetch admins");
        }
    }
    static async getUserById(userId) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    fullName: true,
                    nickName: true,
                    country: true,
                    phone: true,
                    gender: true,
                    email: true,
                    profileImage: true,
                    role: true,
                    totalScore: true,
                    answered: true,
                },
            });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            return user;
        }
        catch (error) {
            console.error("Error fetching user by ID:", error);
            throw new appError_1.InternalServerError("Unable to fetch user");
        }
    }
    static async deleteUser(userId) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            await prisma.user.delete({ where: { id: userId } });
            return { message: "User deleted successfully" };
        }
        catch (error) {
            console.error("Error deleting user:", error);
            throw new appError_1.InternalServerError("Unable to delete user");
        }
    }
    static async updateUser(userId, updates) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            const { fullName, email, role, gender, country, phone, nickName } = updates;
            const updateData = {};
            if (fullName)
                updateData.fullName = fullName;
            if (email) {
                const existingUser = await prisma.user.findUnique({ where: { email } });
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
            updateData.gender = gender;
            updateData.country = country;
            updateData.phone = phone;
            updateData.nickName = nickName;
            const updatedUser = await prisma.user.update({
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
            throw new appError_1.InternalServerError("Unable to update user");
        }
    }
    static async updateProfileImage(userId, imageUrl) {
        return await prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
        });
    }
}
exports.UserService = UserService;
