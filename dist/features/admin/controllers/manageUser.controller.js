"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const manageUser_service_1 = require("../services/manageUser.service");
// const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; 
class AdminController {
    static async addAdmin(req, res) {
        const { email } = req.body;
        try {
            const updatedUser = await manageUser_service_1.AdminService.addAdmin(email);
            res.status(200).json({
                success: true,
                message: "User promoted to admin.",
                user: updatedUser,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error });
        }
    }
    static async removeAdmin(req, res) {
        const { email } = req.body;
        try {
            const updatedUser = await manageUser_service_1.AdminService.removeAdmin(email);
            res.status(200).json({
                success: true,
                message: "User demoted from admin.",
                user: updatedUser,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error });
        }
    }
}
exports.AdminController = AdminController;
