"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderBoard_controller_1 = require("../controllers/leaderBoard.controller");
const router = express_1.default.Router();
router.get("/", leaderBoard_controller_1.leaderboardController);
exports.default = router;
