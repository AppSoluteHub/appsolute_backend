"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userBehaviorService = exports.UserBehaviorService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class UserBehaviorService {
    async trackInteraction(interaction, page, device) {
        return await prisma.userBehavior.create({
            data: {
                interaction,
                page,
                device,
            },
        });
    }
}
exports.UserBehaviorService = UserBehaviorService;
exports.userBehaviorService = new UserBehaviorService();
