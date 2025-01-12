"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderBoard_controller_1 = require("../controllers/leaderBoard.controller");
const leaderboard_validator_1 = require("../../../validators/leaderboard.validator");
const router = express_1.default.Router();
router.post('/leaderboard/create', leaderboard_validator_1.validateLeaderboard, leaderBoard_controller_1.LeaderboardController.createLeaderboard);
router.post('/leaderboard/update', leaderboard_validator_1.validateLeaderboard, leaderBoard_controller_1.LeaderboardController.addOrUpdateScore);
router.get('/leaderboard', leaderBoard_controller_1.LeaderboardController.fetchLeaderboard);
router.post('/leaderboard/reset', leaderBoard_controller_1.LeaderboardController.resetLeaderboard);
exports.default = router;
