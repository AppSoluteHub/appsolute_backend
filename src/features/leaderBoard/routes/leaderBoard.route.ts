import express from 'express';
import { LeaderboardController } from '../controllers/leaderBoard.controller';
import { validateLeaderboard } from '../../../validators/leaderboard.validator';

const router = express.Router();

router.post('/leaderboard/create',validateLeaderboard, LeaderboardController.createLeaderboard);
router.post('/leaderboard/update',validateLeaderboard, LeaderboardController.addOrUpdateScore);
router.get('/leaderboard', LeaderboardController.fetchLeaderboard);
router.post('/leaderboard/reset', LeaderboardController.resetLeaderboard);

export default router;

