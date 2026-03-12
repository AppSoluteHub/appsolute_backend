"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
const notificationController = new controller_1.NotificationController();
// Get all notifications for the authenticated user
router.get("/", auth_middleware_1.default, (req, res, next) => notificationController.getNotifications(req, res, next));
// Get unread notification count
router.get("/unread/count", auth_middleware_1.default, (req, res, next) => notificationController.getUnreadCount(req, res, next));
// Mark a notification as read
router.patch("/:id/read", auth_middleware_1.default, (req, res, next) => notificationController.markAsRead(req, res, next));
// Mark all notifications as read
router.patch("/read/all", auth_middleware_1.default, (req, res, next) => notificationController.markAllAsRead(req, res, next));
// Delete a notification
router.delete("/:id", auth_middleware_1.default, (req, res, next) => notificationController.deleteNotification(req, res, next));
// Delete all notifications
router.delete("/", auth_middleware_1.default, (req, res, next) => notificationController.deleteAllNotifications(req, res, next));
exports.default = router;
