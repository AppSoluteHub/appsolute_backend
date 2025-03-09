"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const userValidator_1 = require("../../validators/userValidator");
const router = express_1.default.Router();
router.get("/", user_controller_1.UserController.getUsers);
router.get("/:userId", user_controller_1.UserController.getUserById);
router.delete("/:userId", user_controller_1.UserController.deleteUser);
router.patch("/:userId", userValidator_1.validateUpdateUser, user_controller_1.UserController.updateUser);
exports.default = router;
