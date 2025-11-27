"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userBehaviorService = exports.UserBehaviorService = void 0;
const prisma_1 = require("../../utils/prisma");
class UserBehaviorService {
    async trackInteraction(interaction, page, device) {
        return await prisma_1.prisma.userBehavior.create({
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
