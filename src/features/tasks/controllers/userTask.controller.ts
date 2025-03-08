import { Request, Response } from "express";
import { answerTask } from "../services/userTask.service";
import { BadRequestError, InternalServerError } from "../../../lib/appError";

export const answerTaskHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const { taskId, userAnswer } = req.body;

    if (!userId) {
      res.status(401).json({ error: "You are not authenticated" });
      return;
    }

    if (!taskId || !userAnswer) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const userTask = await answerTask(userId, taskId, userAnswer);
    res.status(201).json(userTask);
  } catch (error: any) {
    console.error("Error in answerTaskHandler:", error);

    if (error instanceof BadRequestError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof InternalServerError) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};
