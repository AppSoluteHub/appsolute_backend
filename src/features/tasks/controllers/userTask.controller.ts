import { Request, Response } from "express";
import { answerTask } from "../services/userTask.service";

export const answerTaskHandler = async (req: Request, res: Response) => {
  try {
    const { userId, taskId, userAnswer } = req.body;
    const userTask = await answerTask(userId, taskId, userAnswer);
    res.status(201).json(userTask);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
