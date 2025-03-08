import { Request, Response, NextFunction } from "express";
import { cachedLeaderboard, lastUpdated, refreshLeaderboard } from "../services/leaderBoard.services";

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
