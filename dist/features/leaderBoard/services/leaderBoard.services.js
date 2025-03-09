"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshLeaderboard = exports.lastUpdated = exports.cachedLeaderboard = exports.updateUserScore = exports.getLeaderboard = void 0;
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
const updateUserScore = async (userId, points) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { totalScore: { increment: points } },
        });
        // Refresh leaderboard cache immediately
        await (0, exports.refreshLeaderboard)();
    }
    catch (error) {
        console.error("Error updating user score:", error);
        throw new Error("Failed to update user score");
    }
};
exports.updateUserScore = updateUserScore;
// Function to refresh leaderboard cache
exports.cachedLeaderboard = null;
exports.lastUpdated = 0;
const refreshLeaderboard = async () => {
    try {
        exports.cachedLeaderboard = await (0, exports.getLeaderboard)();
        exports.lastUpdated = Date.now();
    }
    catch (error) {
        console.error("Error refreshing leaderboard:", error);
    }
};
exports.refreshLeaderboard = refreshLeaderboard;
// Initial fetch to populate cache
(0, exports.refreshLeaderboard)();
