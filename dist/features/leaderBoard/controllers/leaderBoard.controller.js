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
exports.LeaderboardController = void 0;
const leaderBoard_services_1 = require("../services/leaderBoard.services");
class LeaderboardController {
    /**
     * Create a new leaderboard entry for a user.
     * @param req - The HTTP request object.
     * @param res - The HTTP response object.
     */
    static createLeaderboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, score, answered } = req.body;
                // Call the service method to create leaderboard entry
                yield leaderBoard_services_1.LeaderboardService.createLeaderboard(userId, score, answered);
                res.status(201).json({ message: 'Leaderboard entry created successfully.' });
            }
            catch (error) {
                res.status(400).json({ error });
            }
        });
    }
    /**
     * Add or update user score on the leaderboard.
     * @param req - The HTTP request object.
     * @param res - The HTTP response object.
     */
    static addOrUpdateScore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, score } = req.body;
                // Call the service method to add or update score
                yield leaderBoard_services_1.LeaderboardService.addOrUpdateScore(userId, score);
                res.status(200).json({ message: 'Leaderboard score updated successfully.' });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ error });
            }
        });
    }
    /**
     * Fetch leaderboard rankings with pagination.
     * @param req - The HTTP request object.
     * @param res - The HTTP response object.
     */
    static fetchLeaderboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // Call the service method to fetch leaderboard
                const leaderboard = yield leaderBoard_services_1.LeaderboardService.fetchLeaderboard(page, limit);
                res.status(200).json(leaderboard);
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ error });
            }
        });
    }
    /**
     * Reset the leaderboard (e.g., for weekly/monthly reset).
     * @param req - The HTTP request object.
     * @param res - The HTTP response object.
     */
    static resetLeaderboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Call the service method to reset leaderboard
                yield leaderBoard_services_1.LeaderboardService.resetLeaderboard();
                res.status(200).json({ message: 'Leaderboard reset successfully.' });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ error });
            }
        });
    }
}
exports.LeaderboardController = LeaderboardController;
