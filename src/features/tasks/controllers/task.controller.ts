import { Request, Response } from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../services/task.service";


export const createTaskHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { question, options, correctAnswer , url} = req.body;
 
    if (!question || !options || !correctAnswer) {
       res.status(400).json({ error: "All fields are required" });
    }

    if (!Array.isArray(options)) {
       res.status(400).json({ error: "Options must be an array" });
    }

    const task = await createTask(question, options, correctAnswer, url);
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
export const getTaskByIdHandler = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = await getTaskById(taskId);
    res.json({mesage : "Task fetched successfully", "Task": task});
    
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const deleteTaskHandler = async (req: Request, res: Response) => {
  try {
    const taskId= req.params.id;
    await deleteTask(taskId);
    res.status(204).send(`Task of Id : ${taskId} was deleted successfully`);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const updateTaskHandler = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const { question, options, correctAnswer } = req.body;
    await updateTask(taskId, question, options, correctAnswer);
    res.status(204).send(`Task of Id : ${taskId} was updated successfully`);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

