import { Router } from "express";
import { NotificationController } from "./controller";
import authenticate from "../../middlewares/auth.middleware";

const router = Router();
const notificationController = new NotificationController();

// Get all notifications for the authenticated user
router.get("/", authenticate, (req, res, next) =>
  notificationController.getNotifications(req, res, next)
);

// Get unread notification count
router.get("/unread/count", authenticate, (req, res, next) =>
  notificationController.getUnreadCount(req, res, next)
);

// Mark a notification as read
router.patch("/:id/read", authenticate, (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

// Mark all notifications as read
router.patch("/read/all", authenticate, (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

// Delete a notification
router.delete("/:id", authenticate, (req, res, next) =>
  notificationController.deleteNotification(req, res, next)
);

// Delete all notifications
router.delete("/", authenticate, (req, res, next) =>
  notificationController.deleteAllNotifications(req, res, next)
);

export default router;
