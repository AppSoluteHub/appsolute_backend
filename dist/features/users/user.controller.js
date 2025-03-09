"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    static async getUsers(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const users = await user_service_1.UserService.getUsers({
                page: Number(page),
                limit: Number(limit),
                search: String(search),
            });
            res.status(200).json({
                message: "Users fetched successfully",
                data: users,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    static async getAdmins(req, res) {
        try {
            const { search } = req.query;
            const admins = await user_service_1.UserService.getAdmins({
                search: search,
            });
            return res.status(200).json({ success: true, data: admins });
        }
        catch (error) {
            console.error("Error in getAdmins controller:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await user_service_1.UserService.getUserById(userId);
            res.status(200).json({
                message: "User fetched successfully",
                data: user,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const result = await user_service_1.UserService.deleteUser(userId);
            res.status(200).json({
                message: result.message,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    static async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;
            const profileImageFile = req.file;
            const updatedUser = await user_service_1.UserService.updateUser(userId, {
                ...updates,
                profileImageFile
            });
            res.status(200).json({
                message: "User updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    static async updateProfileImage(req, res) {
        try {
            const { userId } = req.params;
            const profileImageFile = req.file;
            if (!profileImageFile) {
                return res.status(400).json({ error: "No image file provided" });
            }
            const updatedUser = await user_service_1.UserService.updateUserProfileImage(userId, profileImageFile);
            res.status(200).json({
                message: "Profile image updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}
exports.UserController = UserController;
