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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class LeaderboardService {
    /**
     * Create a new leaderboard entry for a user.
     * @param userId - The user's ID.
     * @param score - The initial score for the user (default is 0).
     * @param answered - The number of questions answered (default is 0).
     */
    static createLeaderboard(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, score = 0, answered = 0) {
            // Check if the leaderboard entry already exists for the user
            const existingEntry = yield prisma.leaderboard.findUnique({
                where: { userId },
            });
            if (existingEntry) {
                throw new Error(`Leaderboard entry already exists for user with ID ${userId}`);
            }
            // Verify that the user exists
            const user = yield prisma.user.findUnique({
                where: { id: userId },
                select: { fullName: true }, // Ensure fullName is accessible
            });
            if (!user) {
                throw new Error(`User with ID ${userId} does not exist`);
            }
            // Create the new leaderboard entry
            yield prisma.leaderboard.create({
                data: {
                    userId,
                    score,
                    answered,
                    rank: 0, // Will be recalculated after entry
                },
            });
            // Recalculate rankings
            yield LeaderboardService.recalculateRankings();
        });
    }
    /**
     * Add or update user score on the leaderboard.
     * @param userId - The user's ID.
     * @param score - The score to add/update.
     */
    static addOrUpdateScore(userId, score) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingEntry = yield prisma.leaderboard.findUnique({
                where: { userId },
            });
            if (existingEntry) {
                yield prisma.leaderboard.update({
                    where: { userId },
                    data: {
                        score: existingEntry.score + score,
                        answered: existingEntry.answered + 1,
                    },
                });
            }
            else {
                yield prisma.leaderboard.create({
                    data: {
                        userId,
                        score,
                        answered: 1,
                        rank: 0,
                    },
                });
            }
            yield LeaderboardService.recalculateRankings();
        });
    }
    /**
     * Fetch leaderboard rankings with pagination.
     * @param page - Page number (default is 1).
     * @param limit - Number of entries per page (default is 10).
     */
    static fetchLeaderboard() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const offset = (page - 1) * limit;
            const leaderboard = yield prisma.leaderboard.findMany({
                skip: offset,
                take: limit,
                orderBy: { score: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            profileImage: true,
                        },
                    },
                },
            });
            const totalCount = yield prisma.leaderboard.count();
            return {
                total: totalCount,
                page,
                limit,
                leaderboard,
            };
        });
    }
    /**
     * Reset leaderboard (e.g., for weekly/monthly reset).
     */
    static resetLeaderboard() {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.leaderboard.deleteMany();
        });
    }
    /**
     * Recalculate rankings after score updates.
     */
    static recalculateRankings() {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboardEntries = yield prisma.leaderboard.findMany({
                orderBy: { score: 'desc' },
            });
            let rank = 1;
            for (const entry of leaderboardEntries) {
                yield prisma.leaderboard.update({
                    where: { id: entry.id },
                    data: { rank: rank++ },
                });
            }
        });
    }
}
exports.LeaderboardService = LeaderboardService;
