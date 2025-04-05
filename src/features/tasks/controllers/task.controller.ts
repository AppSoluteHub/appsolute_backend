import { Request, Response } from "express";
import { createTaskWithQuestions, deleteTask, getAllTasks, getTaskById, updateTask,  } from "../services/task.service";
import { use } from "passport";


export const createTaskHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, tags, url, points, questions } = req.body;

   
    if (!title || !tags || !url || !points || !questions || !Array.isArray(questions)) {
      res.status(400).json({ error: "All fields are required and 'questions' must be an array" });
      return;
    }

    if (!Array.isArray(tags)) {
      res.status(400).json({ error: "Tags must be an array" });
      return;
    }

   
    for (const question of questions) {
      if (!question.questionText || !question.options || !question.correctAnswer || !Array.isArray(question.options)) {
        res.status(400).json({ error: "Each question must have a questionText, options (array), and a correctAnswer" });
        return;
      }
    }

    const task = await createTaskWithQuestions(title, tags, url, points, questions);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTasksHandler = async (req: Request, res: Response) => {
  const {userId} = req.body;
  try {
    const tasks = await getAllTasks(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error });
  }

  
};
export const getTaskByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const taskId = req.params.id;
    const task = await getTaskById(taskId, userId);
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


export const updateTaskHandler = async (req: Request, res: Response):Promise<void> => {
  try {
    const taskId = req.params.id;
    const { title, tags, url, points, questions } = req.body;

    if (!title || !tags || !url || !points || !questions || !Array.isArray(questions)) {
       res.status(400).json({ error: "All fields are required and 'questions' must be an array" });
       return;
    }

    for (const question of questions) {
      if (!question.id || !question.questionText || !question.options || !question.correctAnswer || !Array.isArray(question.options)) {
         res.status(400).json({ error: "Each question must have an id, questionText, options (array), and a correctAnswer" });
         return;
      }
    }

    await updateTask(taskId, title, tags, url, points, questions);
    res.status(204).send(`Task with ID: ${taskId} was updated successfully`);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


