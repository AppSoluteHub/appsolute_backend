import { Request, Response } from "express";
import { answerTask } from "../services/userTask.service";

export const answerTaskHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { taskId } = req.params;
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: "Answers must be provided in an array." });
      return;
    } 


    const response = await answerTask(userId, taskId, answers);
     
    res.status(200).json(response);
    return;
  } catch (error: any) {
    console.error("Error in answerTaskHandler:", error);

    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};
