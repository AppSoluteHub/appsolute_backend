"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardController = void 0;
const leaderBoard_services_1 = require("../services/leaderBoard.services");
const leaderboardController = async (req, res, next) => {
    try {
        if (!leaderBoard_services_1.cachedLeaderboard) {
            await (0, leaderBoard_services_1.refreshLeaderboard)();
        }
        res.status(200).json({ success: true, leaderboard: leaderBoard_services_1.cachedLeaderboard, lastUpdated: leaderBoard_services_1.lastUpdated });
    }
    catch (error) {
        next(error);
    }
};
exports.leaderboardController = leaderboardController;
