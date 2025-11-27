"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const prisma_1 = require("../../../utils/prisma");
const getLeaderboard = async () => {
    return await prisma_1.prisma.user.findMany({
        orderBy: { totalScore: "desc" },
        take: 10,
        select: {
            id: true,
            fullName: true,
            totalScore: true,
            answered: true,
            joined: true,
            profileImage: true
        },
    });
};
exports.getLeaderboard = getLeaderboard;
