import { Request, Response, NextFunction } from "express";
import { getLeaderboard } from "../services/leaderBoard.services";

let cachedLeaderboard: any = null;
let lastUpdated: number = 0;

const refreshLeaderboard = async () => {
  try {
    cachedLeaderboard = await getLeaderboard();
    lastUpdated = Date.now();
  } catch (error) {
    console.error("Error refreshing leaderboard:", error);
  }
};

refreshLeaderboard();

setInterval(refreshLeaderboard, 24 * 60 * 60 * 1000);

export const leaderboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!cachedLeaderboard) {
      await refreshLeaderboard();
    }
    res.status(200).json({ success: true, leaderboard: cachedLeaderboard, lastUpdated });
  } catch (error) {
    next(error);
  }
};
