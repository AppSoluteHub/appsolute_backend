import { Request, Response } from "express";
import { answerTask } from "../services/userTask.service";

export const answerTaskHandler = async (req: Request, res: Response) => {
  try {
    const userId =req.params.userId;
    console.log(userId);
    const {taskId, userAnswer } = req.body;
    if (!userId ) {
      res.status(401).json({ error: "You are not authenticated" });
    }
    if (!taskId || !userAnswer) {
      res.status(400).json({ error: "All fields are required" })};
    const userTask = await answerTask(userId, taskId, userAnswer);
    res.status(201).json(userTask);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
