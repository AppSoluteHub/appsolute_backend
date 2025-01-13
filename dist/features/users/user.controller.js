"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, search = "" } = req.query;
                const users = yield user_service_1.UserService.getUsers({
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
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const user = yield user_service_1.UserService.getUserById(userId);
                res.status(200).json({
                    message: "User fetched successfully",
                    data: user,
                });
            }
            catch (error) {
                res.status(error.statusCode || 500).json({ error: error.message });
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const result = yield user_service_1.UserService.deleteUser(userId);
                res.status(200).json({
                    message: result.message,
                });
            }
            catch (error) {
                res.status(error.statusCode || 500).json({ error: error.message });
            }
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const updates = req.body;
                const updatedUser = yield user_service_1.UserService.updateUser(userId, updates);
                res.status(200).json({
                    message: "User updated successfully",
                    data: updatedUser,
                });
            }
            catch (error) {
                res.status(error.statusCode || 500).json({ error: error.message });
            }
        });
    }
}
exports.UserController = UserController;
