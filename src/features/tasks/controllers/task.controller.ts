import { Request, Response } from "express";
import { createTask, getAllTasks } from "../services/task.service";

export const createTaskHandler = async (req: Request, res: Response) => {
  try {
    const { question, options, correctAnswer } = req.body;
    const task = await createTask(question, options, correctAnswer);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getTasksHandler = async (req: Request, res: Response) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
