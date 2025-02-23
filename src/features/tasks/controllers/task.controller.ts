import { Request, Response } from "express";
import { createTask, getAllTasks } from "../services/task.service";


export const createTaskHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, options, correctAnswer } = req.body;

    if (!question || !options || !correctAnswer) {
       res.status(400).json({ error: "All fields are required" });
    }

    if (!Array.isArray(options)) {
       res.status(400).json({ error: "Options must be an array" });
    }

    const task = await createTask(question, options, correctAnswer);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error || "Internal Server Error" });
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
