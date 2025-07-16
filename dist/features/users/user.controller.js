"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const appError_1 = require("../../lib/appError");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
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
            res.status(200).json({ success: true, data: admins });
            return;
        }
        catch (error) {
            console.error("Error in getAdmins controller:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal Server Error" });
            return;
        }
    }
    static async getRoles(req, res) {
        try {
            const { search } = req.query;
            const admins = await user_service_1.UserService.getAdmins({
                search: search,
            });
            res.status(200).json({ success: true, data: admins });
            return;
        }
        catch (error) {
            console.error("Error in getAdmins controller:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal Server Error" });
            return;
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
            const { password, ...updates } = req.body;
            if (password) {
                res.status(400).json({ error: "Password update is not allowed" });
                return;
            }
            const updatedUser = await user_service_1.UserService.updateUser(userId, updates);
            res.status(200).json({
                message: "User updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    static async updateUserRole(req, res) {
        try {
            const { role, fullName, email } = req.body;
            // Validate role presence
            if (!role) {
                res.status(400).json({ error: "Role is required" });
                return;
            }
            // Validate role value
            const allowedRoles = [
                "ADMIN",
                "SUPERADMIN",
                "GUEST",
                "EDITOR",
                "CONTRIBUTOR",
            ];
            if (!allowedRoles.includes(role)) {
                res
                    .status(400)
                    .json({ error: `Role must be one of: ${allowedRoles.join(", ")}` });
                return;
            }
            if (role === "ADMIN" && req.user?.role !== "SUPERADMIN") {
                res
                    .status(403)
                    .json({ error: "Forbidden: Only superadmin can assign admin role" });
                return;
            }
            if (role === "SUPERADMIN" && req.user?.role !== "SUPERADMIN") {
                res
                    .status(403)
                    .json({
                    error: "Forbidden: Only superadmin can assign superadmin role",
                });
                return;
            }
            // Optionally check if current user has permission (e.g., is admin or superadmin)
            const currentUser = req.user;
            if (!currentUser || !["SUPERADMIN", "ADMIN"].includes(currentUser.role)) {
                res
                    .status(403)
                    .json({
                    error: "Forbidden: You don't have permission to update roles",
                });
                return;
            }
            // Update user role only
            const updates = { role };
            const updatedUser = await user_service_1.UserService.updateUserRole(email, fullName, updates);
            res.status(200).json({
                message: "User role updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
    static async updateProfileImage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new appError_1.BadRequestError("Unauthorized: User ID is required");
            }
            console.log("User ID:", userId);
            console.log("Received file:", req.file);
            let imageUrl = "";
            if (req.file) {
                try {
                    const file = req.file;
                    console.log(file);
                    imageUrl = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSolute/profile" }, (error, result) => {
                            if (error) {
                                console.error("Cloudinary upload error:", error);
                                return reject(new appError_1.BadRequestError("Failed to upload image to Cloudinary"));
                            }
                            console.log("Cloudinary upload result:", result);
                            if (result)
                                return resolve(result.secure_url);
                        });
                        uploadStream.end(file.buffer);
                    });
                }
                catch (error) {
                    return next(error);
                }
            }
            else {
                throw new appError_1.BadRequestError("No image file uploaded");
            }
            console.log("Image URL:", imageUrl);
            const updatedUser = await user_service_1.UserService.updateProfileImage(userId, imageUrl);
            console.log("Updated User:", updatedUser);
            res.status(200).json({
                success: true,
                message: "Profile image updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
