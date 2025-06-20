import { NextFunction, Request, Response } from "express";
import { createTaskWithQuestions, deleteTaskById, getAllTasks, getLeaderboardProgressService, getTaskById, getTasks, getUserTaskProgressService, updateTaskWithQuestions  } from "../services/task.service";
import { BadRequestError, NotFoundError } from "../../../lib/appError";
import cloudinary from "../../../config/cloudinary";


export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    Object.keys(req.body).forEach((key) => {
      const trimmed = key.trim();
      if (trimmed !== key) {
        req.body[trimmed] = req.body[key];
        delete req.body[key];
      }
    });

    const { title, description, categories, tags, url, points, questions } = req.body;

    let parsedCategories: string[] = [];
    try {
      parsedCategories = JSON.parse(categories);
    } catch (e) {
      parsedCategories = Array.isArray(categories) ? categories : [categories];
    }

    let parsedTags: string[] = [];
    
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = Array.isArray(tags) ? tags : [tags];
    }

    let parsedQuestions: any[] = [];
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (e) {
      parsedQuestions = Array.isArray(questions) ? questions : [questions];
    }

    if (
      !title ||
      parsedCategories.length === 0 ||
      parsedTags.length === 0 ||
      !url ||
      !points ||
      parsedQuestions.length === 0
    ) {
      console.error("Missing required fields", {
        title,
        parsedCategories,
        parsedTags,
        url,
        points,
        parsedQuestions,
      });
      throw new BadRequestError(
        "Title, categories, tags, url, points and questions are all required"
      );
    }

    for (const [index, q] of parsedQuestions.entries()) {
      if (
        !q.questionText ||
        !q.options ||
        !Array.isArray(q.options) ||
        !q.correctAnswer
      ) {
        console.error(`Invalid question at index ${index}:`, q);
        throw new BadRequestError(
          "Each question must have questionText, options (array), and correctAnswer"
        );
      }
    }

    let imageUrl = "";
    if (req.file) {
      try {
        const file = req.file as Express.Multer.File;
        imageUrl = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "AppSolute" },
            (err, result) => {
              if (err || !result) {
                console.error("Cloudinary upload failed:", err);
                return reject(new BadRequestError("Image upload failed"));
              }
              resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      } catch (uploadError) {
        console.error("Error during image upload:", uploadError);
        throw uploadError;
      }
    }

    const task = await createTaskWithQuestions(
      title,
      parsedCategories,
      parsedTags,
      url,
      Number(points),
      imageUrl,
      description,
      parsedQuestions
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (err: any) {
    console.error("Unhandled error in createTaskHandler:", err);
    next(err); 
  }
}

export const getTasksHandler = async (req: Request, res: Response):Promise<void> => {
  const { userId } = req.params;

  try {
    const tasks = await getAllTasks(userId);
     res.status(200).json(tasks);
     return;
  } catch (error: any) {
    console.error("Error in getTasksHandler:", error);
    if (error instanceof NotFoundError) {
       res.status(404).json({ error: error.message });
       return;
    }

     res.status(500).json({ error: error.message || "Internal error" });
     return;
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


export const getUserTaskProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const result = await getUserTaskProgressService(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboardProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const result = await getLeaderboardProgressService(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export async function updateTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
   
    Object.keys(req.body).forEach((key) => {
      const trimmed = key.trim();
      if (trimmed !== key) {
        req.body[trimmed] = req.body[key];
        delete req.body[key];
      }
    });

    const taskId = req.params.taskId;
    if (!taskId) throw new BadRequestError("Task ID is required");
     
    // 2) Destructure raw values
    const { title, description, categories, tags, url, points, questions } = req.body;
      
    // 3) Parse categories JSON if needed
    let parsedCategories: string[] | undefined;
    if (categories !== undefined) {
      try {
        parsedCategories = JSON.parse(categories);
      } catch {
        parsedCategories = Array.isArray(categories) ? categories : [categories];
      }
    }

    // 4) Parse tags (comma-list or array)
    let parsedTags: string[] | undefined;
    if (tags !== undefined) {
      if (typeof tags === "string" && tags.includes(",")) {
        parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      } else {
        parsedTags = [tags as string];
      }
    }

    // 5) **Parse questions JSON** or wrap in an array
    let parsedQuestions: any[] | undefined;
    if (questions !== undefined) {
      try {
        parsedQuestions = JSON.parse(questions);
      } catch {
        // if it wasn’t valid JSON, but is already an array
        if (Array.isArray(questions)) {
          parsedQuestions = questions;
        } else {
          throw new BadRequestError("Questions must be a JSON array or an actual array");
        }
      }

      // 6) Validate shape
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new BadRequestError("Questions must be a non-empty array");
      }
      for (const q of parsedQuestions) {
        if (
          !q.questionText ||
          !Array.isArray(q.options) ||
          !q.correctAnswer
        ) {
          throw new BadRequestError(
            "Each question must have questionText, options (array), and correctAnswer"
          );
        }
      }
    }

    // 7) Handle image upload (unchanged)
    let imageUrl: string | undefined;
    if (req.file) {
      const file = req.file as Express.Multer.File;
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "AppSolute" },
          (err, result) => {
            if (err) return reject(new BadRequestError("Image upload failed"));
            resolve(result!.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // 8) Build payload
    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (parsedCategories !== undefined) updatePayload.categories = parsedCategories;
    if (parsedTags !== undefined) updatePayload.tags = parsedTags;
    if (url !== undefined) updatePayload.url = url;
    if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl;
    if (points !== undefined) updatePayload.points = Number(points);
    if (parsedQuestions !== undefined) updatePayload.questions = parsedQuestions;

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestError("No valid fields provided to update");
    }

    // 9) Call your service
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

