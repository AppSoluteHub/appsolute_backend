"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getLeaderboard = async () => {
    return await prisma.user.findMany({
        orderBy: { totalScore: "desc" },
        take: 10,
        select: {
            id: true,
            fullName: true,
            totalScore: true,
        },
    });
};
exports.getLeaderboard = getLeaderboard;
