"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const service_1 = require("./service");
const appResponse_1 = __importDefault(require("../../lib/appResponse"));
const appError_1 = require("../../lib/appError");
const notificationService = new service_1.NotificationService();
class NotificationController {
    /**
     * Get all notifications for the authenticated user
     */
    async getNotifications(req, res, next) {
        try {
            const userId = req.user?.id;
            const { limit = "20", skip = "0" } = req.query;
            if (!userId) {
                throw new appError_1.BadRequestError("User ID is required");
            }
            const result = await notificationService.getUserNotifications(userId, parseInt(limit), parseInt(skip));
            res.status(200).json({
                ...(0, appResponse_1.default)("Notifications retrieved successfully", result.data),
                pagination: {
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get unread notification count
     */
    async getUnreadCount(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new appError_1.BadRequestError("User ID is required");
            }
            const count = await notificationService.getUnreadCount(userId);
            res.status(200).json((0, appResponse_1.default)("Unread count retrieved successfully", { count }));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Mark a notification as read
     */
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!id) {
                throw new appError_1.BadRequestError("Notification ID is required");
            }
            const result = await notificationService.markAsRead(id);
            res.status(200).json((0, appResponse_1.default)("Notification marked as read", result));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Mark all notifications as read for the user
     */
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new appError_1.BadRequestError("User ID is required");
            }
            const result = await notificationService.markAllAsRead(userId);
            res.status(200).json((0, appResponse_1.default)("All notifications marked as read", result));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a notification
     */
    async deleteNotification(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new appError_1.BadRequestError("Notification ID is required");
            }
            const result = await notificationService.deleteNotification(id);
            res.status(200).json((0, appResponse_1.default)("Notification deleted successfully", result));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete all notifications for a user
     */
    async deleteAllNotifications(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new appError_1.BadRequestError("User ID is required");
            }
            const result = await notificationService.deleteAllNotifications(userId);
            res.status(200).json((0, appResponse_1.default)("All notifications deleted successfully", result));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
