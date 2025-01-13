"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
class UserService {
    static getUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, search = "", }) {
            try {
                const skip = (page - 1) * limit;
                const users = yield prisma.user.findMany({
                    where: {
                        OR: [
                            { fullName: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } },
                        ],
                    },
                    skip,
                    take: limit,
                });
                const totalUsers = yield prisma.user.count({
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
        });
    }
    static getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId)
                    throw new appError_1.BadRequestError("User ID is required");
                const user = yield prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImage: true,
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
        });
    }
    static deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId)
                    throw new appError_1.BadRequestError("User ID is required");
                const user = yield prisma.user.findUnique({ where: { id: userId } });
                if (!user)
                    throw new appError_1.NotFoundError("User not found");
                yield prisma.user.delete({ where: { id: userId } });
                return { message: "User deleted successfully" };
            }
            catch (error) {
                console.error("Error deleting user:", error);
                throw new appError_1.InternalServerError("Unable to delete user");
            }
        });
    }
    static updateUser(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId)
                    throw new appError_1.BadRequestError("User ID is required");
                const user = yield prisma.user.findUnique({ where: { id: userId } });
                if (!user)
                    throw new appError_1.NotFoundError("User not found");
                const { fullName, email, profileImage, password } = updates;
                const updateData = {};
                if (fullName)
                    updateData.fullName = fullName;
                if (email) {
                    const existingUser = yield prisma.user.findUnique({ where: { email } });
                    if (existingUser && existingUser.id !== userId) {
                        throw new appError_1.DuplicateError("Email already in use");
                    }
                    updateData.email = email;
                }
                if (profileImage)
                    updateData.profileImage = profileImage;
                if (password) {
                    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                    updateData.password = hashedPassword;
                }
                const updatedUser = yield prisma.user.update({
                    where: { id: userId },
                    data: updateData,
                });
                return updatedUser;
            }
            catch (error) {
                console.error("Error updating user:", error);
                throw new appError_1.InternalServerError("Unable to update user");
            }
        });
    }
}
exports.UserService = UserService;
