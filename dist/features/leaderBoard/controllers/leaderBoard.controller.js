"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardController = void 0;
const leaderBoard_services_1 = require("../services/leaderBoard.services");
const leaderboardController = async (req, res, next) => {
    try {
        const leaderboard = await (0, leaderBoard_services_1.getLeaderboard)();
        res.status(200).json({ success: true, leaderboard });
    }
    catch (error) {
        next(error);
    }
};
exports.leaderboardController = leaderboardController;
