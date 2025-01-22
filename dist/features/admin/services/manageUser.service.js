"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class AdminService {
    static async addAdmin(email) {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            if (user.role === "ADMIN")
                throw new appError_1.DuplicateError("User is already an admin");
            return await prisma.user.update({
                where: { email },
                data: { role: "ADMIN" },
            });
        }
        catch (error) {
            console.log(error);
            throw new appError_1.InternalServerError("Something went error adding the user as an admin");
        }
    }
    static async removeAdmin(email) {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new appError_1.NotFoundError("User not found");
            }
            if (user.role !== "ADMIN") {
                throw new appError_1.BadRequestError("User is not an admin");
            }
            return await prisma.user.update({
                where: { email },
                data: { role: "GUEST" },
            });
        }
        catch (error) {
            console.log(error);
            throw new appError_1.InternalServerError("Something went wrong removing a user as an admin");
        }
    }
}
exports.AdminService = AdminService;
