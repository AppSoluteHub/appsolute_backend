"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../../utils/prisma");
class NotificationService {
    /**
     * Create a notification for a user
     */
    async createNotification(userId, type, title, message, relatedEntityId, relatedEntityType) {
        try {
            const notification = await prisma_1.prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    relatedEntityId: relatedEntityId || null,
                    relatedEntityType: relatedEntityType || null,
                },
            });
            return notification;
        }
        catch (error) {
            console.error("Error creating notification:", error);
            throw error;
        }
    }
    /**
     * Get all notifications for a user
     */
    async getUserNotifications(userId, limit = 20, skip = 0) {
        try {
            const notifications = await prisma_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            });
            const total = await prisma_1.prisma.notification.count({
                where: { userId },
            });
            return {
                data: notifications,
                total,
                page: Math.ceil(skip / limit) + 1,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    }
    /**
     * Get unread notifications count for a user
     */
    async getUnreadCount(userId) {
        try {
            const count = await prisma_1.prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            });
            return count;
        }
        catch (error) {
            console.error("Error fetching unread count:", error);
            throw error;
        }
    }
    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId) {
        try {
            const notification = await prisma_1.prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            return notification;
        }
        catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }
    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        try {
            const result = await prisma_1.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
            return result;
        }
        catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    }
    /**
     * Delete a notification
     */
    async deleteNotification(notificationId) {
        try {
            const notification = await prisma_1.prisma.notification.delete({
                where: { id: notificationId },
            });
            return notification;
        }
        catch (error) {
            console.error("Error deleting notification:", error);
            throw error;
        }
    }
    /**
     * Delete all notifications for a user
     */
    async deleteAllNotifications(userId) {
        try {
            const result = await prisma_1.prisma.notification.deleteMany({
                where: { userId },
            });
            return result;
        }
        catch (error) {
            console.error("Error deleting all notifications:", error);
            throw error;
        }
    }
    /**
     * Get notifications by type
     */
    async getNotificationsByType(userId, type, limit = 20, skip = 0) {
        try {
            const notifications = await prisma_1.prisma.notification.findMany({
                where: { userId, type },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip,
            });
            const total = await prisma_1.prisma.notification.count({
                where: { userId, type },
            });
            return {
                data: notifications,
                total,
            };
        }
        catch (error) {
            console.error("Error fetching notifications by type:", error);
            throw error;
        }
    }
    /**
     * Bulk create notifications for multiple users
     */
    async bulkCreateNotifications(userIds, type, title, message, relatedEntityId, relatedEntityType) {
        try {
            const notifications = await prisma_1.prisma.notification.createMany({
                data: userIds.map((userId) => ({
                    userId,
                    type,
                    title,
                    message,
                    relatedEntityId: relatedEntityId || null,
                    relatedEntityType: relatedEntityType || null,
                })),
            });
            return notifications;
        }
        catch (error) {
            console.error("Error bulk creating notifications:", error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
