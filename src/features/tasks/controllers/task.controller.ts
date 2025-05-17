import { NextFunction, Request, Response } from "express";
import { createTaskWithQuestions, deleteTaskById, getAllTasks, getTaskById, getTasks, updateTaskWithQuestions  } from "../services/task.service";
import { use } from "passport";
import { BadRequestError } from "../../../lib/appError";


// export const createTaskHandler = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { title, tags, url, points, questions } = req.body;

   
//     if (!title || !tags || !url || !points || !questions || !Array.isArray(questions)) {
//       res.status(400).json({ error: "All fields are required and 'questions' must be an array" });
//       return;
//     }

//     if (!Array.isArray(tags)) {
//       res.status(400).json({ error: "Tags must be an array" });
//       return;
//     }

   
//     for (const question of questions) {
//       if (!question.questionText || !question.options || !question.correctAnswer || !Array.isArray(question.options)) {
//         res.status(400).json({ error: "Each question must have a questionText, options (array), and a correctAnswer" });
//         return;
//       }
//     }

//     const task = await createTaskWithQuestions(title, tags, url, points, questions);
//     res.status(201).json(task);
//   } catch (error) {
//     console.error("Error creating task:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// controllers/taskController.ts


export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, categories, tags, url, points, questions } = req.body;

    // — parse categories (JSON string or array or single string)
    let parsedCategories: string[] = [];
    if (categories) {
      try {
        parsedCategories = JSON.parse(categories);
      } catch {
        parsedCategories = Array.isArray(categories)
          ? categories
          : [categories];
      }
    }

    // — parse tags (CSV string or array)
    const parsedTags: string[] = tags
      ? typeof tags === "string"
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : []
      : [];
    // — validate core fields
    if (
      !title ||
      parsedCategories.length === 0 ||
      parsedTags.length === 0 ||
      !url ||
      !points ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      throw new BadRequestError(
        "Title, categories, tags, url, points and questions are all required"
      );
    }

    // — validate questions array shape
    for (const q of questions) {
      if (
        !q.questionText ||
        !q.options ||
        !Array.isArray(q.options) ||
        !q.correctAnswer
      ) {
        throw new BadRequestError(
          "Each question must have questionText, options (array), and correctAnswer"
        );
      }
    }

    // — call service
    const task = await createTaskWithQuestions(
      title,
      parsedCategories,
      parsedTags,
      url,
      points,
      questions
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (err) {
    next(err);
  }
}


export const getTasksHandler = async (req: Request, res: Response) => {
  const {userId} = req.params;
  try {
    const tasks = await getAllTasks(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error });
  }

  
};



export const getAllTaskHandler = async (req:Request, res: Response) => {
  try {
    const tasks = await getTasks();
    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message:  `Error fetching tasks: ${error.message}` });
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



export async function deleteTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const taskId = req.params.taskId;

    if (!taskId) throw new BadRequestError("Task ID is required");

    await deleteTaskById(taskId);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}




// export async function updateTaskHandler(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const taskId = req.params.taskId;
//     const { title, categories, tags, url, points, questions } = req.body;

//     if (!taskId) throw new BadRequestError("Task ID is required");

//     let parsedCategories: string[] = [];
//     if (categories) {
//       try {
//         parsedCategories = JSON.parse(categories);
//       } catch {
//         parsedCategories = Array.isArray(categories)
//           ? categories
//           : [categories];
//       }
//     }

//     const parsedTags: string[] = tags
//       ? typeof tags === "string"
//         ? tags.split(",").map((t) => t.trim()).filter(Boolean)
//         : Array.isArray(tags)
//         ? tags
//         : []
//       : [];

//     if (
//       !title ||
//       parsedCategories.length === 0 ||
//       parsedTags.length === 0 ||
//       !url ||
//       !points ||
//       !questions ||
//       !Array.isArray(questions) ||
//       questions.length === 0
//     ) {
//       throw new BadRequestError(
//         "Title, categories, tags, url, points and questions are all required"
//       );
//     }

//     for (const q of questions) {
//       if (
//         !q.questionText ||
//         !q.options ||
//         !Array.isArray(q.options) ||
//         !q.correctAnswer
//       ) {
//         throw new BadRequestError(
//           "Each question must have questionText, options (array), and correctAnswer"
//         );
//       }
//     }

//     const updatedTask = await updateTaskWithQuestions(
//       taskId,
//       title,
//       parsedCategories,
//       parsedTags,
//       url,
//       points,
//       questions
//     );

//     res.status(200).json({
//       success: true,
//       message: "Task updated successfully",
//       data: updatedTask,
//     });
//   } catch (err) {
//     next(err);
//   }
// }

export async function updateTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const taskId = req.params.taskId;
    const { title, categories, tags, url, points, questions } = req.body;

    if (!taskId) {
      throw new BadRequestError("Task ID is required");
    }

    let parsedCategories: string[] | undefined;
    if (categories !== undefined) {
      try {
        parsedCategories = JSON.parse(categories);
      } catch {
        parsedCategories = Array.isArray(categories)
          ? categories
          : [categories];
      }
    }

    const parsedTags: string[] | undefined =
      tags !== undefined
        ? typeof tags === "string"
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : []
        : undefined;

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new BadRequestError("Questions must be a non-empty array");
      }

      for (const q of questions) {
        if (
          !q.questionText ||
          !q.options ||
          !Array.isArray(q.options) ||
          !q.correctAnswer
        ) {
          throw new BadRequestError(
            "Each question must have questionText, options (array), and correctAnswer"
          );
        }
      }
    }

    const updatePayload: any = {};

    if (title !== undefined) updatePayload.title = title;
    if (parsedCategories !== undefined)
      updatePayload.categories = parsedCategories;
    if (parsedTags !== undefined) updatePayload.tags = parsedTags;
    if (url !== undefined) updatePayload.url = url;
    if (points !== undefined) updatePayload.points = points;
    if (questions !== undefined) updatePayload.questions = questions;

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestError("No valid fields provided to update");
    }

    const updatedTask = await updateTaskWithQuestions(taskId, updatePayload);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (err) {
    next(err);
  }
}
