"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardController = void 0;
const leaderBoard_services_1 = require("../services/leaderBoard.services");
let cachedLeaderboard = null;
let lastUpdated = 0;
const refreshLeaderboard = async () => {
    try {
        cachedLeaderboard = await (0, leaderBoard_services_1.getLeaderboard)();
        lastUpdated = Date.now();
    }
    catch (error) {
        console.error("Error refreshing leaderboard:", error);
    }
};
refreshLeaderboard();
setInterval(refreshLeaderboard, 24 * 60 * 60 * 1000);
const leaderboardController = async (req, res, next) => {
    try {
        if (!cachedLeaderboard) {
            await refreshLeaderboard();
        }
        res.status(200).json({ success: true, leaderboard: cachedLeaderboard, lastUpdated });
    }
    catch (error) {
        next(error);
    }
};
exports.leaderboardController = leaderboardController;
