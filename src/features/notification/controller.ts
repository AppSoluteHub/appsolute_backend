import { NextFunction, Request, Response } from "express";
import { NotificationService } from "./service";
import appResponse from "../../lib/appResponse";
import { BadRequestError } from "../../lib/appError";

const notificationService = new NotificationService();

export class NotificationController {
  /**
   * Get all notifications for the authenticated user
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const { limit = "20", skip = "0" } = req.query;

      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      const result = await notificationService.getUserNotifications(
        userId,
        parseInt(limit as string),
        parseInt(skip as string)
      );

      res.status(200).json({
        ...appResponse("Notifications retrieved successfully", result.data),
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json(appResponse("Unread count retrieved successfully", { count }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;

      if (!id) {
        throw new BadRequestError("Notification ID is required");
      }

      const result = await notificationService.markAsRead(id);

      res.status(200).json(appResponse("Notification marked as read", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read for the user
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json(appResponse("All notifications marked as read", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Notification ID is required");
      }

      const result = await notificationService.deleteNotification(id);

      res.status(200).json(appResponse("Notification deleted successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      if (!userId) {
        throw new BadRequestError("User ID is required");
      }

      const result = await notificationService.deleteAllNotifications(userId);

      res.status(200).json(appResponse("All notifications deleted successfully", result));
    } catch (error) {
      next(error);
    }
  }
}
