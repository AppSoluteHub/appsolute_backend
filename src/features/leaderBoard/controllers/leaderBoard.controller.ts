import { Request, Response, NextFunction } from "express";
import { getLeaderboard } from "../services/leaderBoard.services";

export const leaderboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leaderboard = await getLeaderboard();
    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};
