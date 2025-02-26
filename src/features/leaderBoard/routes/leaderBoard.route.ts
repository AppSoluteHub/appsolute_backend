import express from "express";
import { leaderboardController } from "../controllers/leaderBoard.controller";

const router = express.Router();

router.get("/", leaderboardController);

export default router;


 