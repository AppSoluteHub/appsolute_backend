import { Request, Response, NextFunction } from "express";
import { AiImageService } from "./ai-image.service";
import { BadRequestError } from "../../lib/appError";

export const transformImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt } = req.body;
    const image = req.file;
    const userId = req.user?.id as string;

    if (!image || !prompt) {
      throw new BadRequestError("Image and prompt are required");
    }

    const result = await AiImageService.transformImageAsync(
      prompt,
      image,
      userId
    );

    res.status(202).json({
      status: "success",
      message: "Image processing started. Use the image ID to check status.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getImageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageId } = req.params;
    const userId = req.user?.id as string;

    const image = await AiImageService.getImageStatus(imageId, userId);

    res.status(200).json({
      status: "success",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// Get user images
export const getUserImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    const result = await AiImageService.getUserImages(
      userId,
      page,
      limit,
      status
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getImageById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageId } = req.params;
    const userId = req.user?.id as string;

    const image = await AiImageService.getImageById(imageId, userId);

    res.status(200).json({
      status: "success",
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// Update image 
export const updateImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageId } = req.params;
    const { prompt } = req.body;
    const userId = req.user?.id as string;

    if (!prompt) {
      throw new BadRequestError("Prompt is required");
    }

    const result = await AiImageService.updateImageAsync(imageId, userId, {
      prompt,
    });

    res.status(202).json({
      status: "success",
      message: "Image update started. Use the image ID to check status.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageId } = req.params;
    const userId = req.user?.id as string;

    const result = await AiImageService.deleteImage(imageId, userId);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id as string;

    const stats = await AiImageService.getUserStats(userId);

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

