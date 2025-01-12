"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const userValidator_1 = require("../../../validators/userValidator");
const router = express_1.default.Router();
router.post("/register", userValidator_1.validateRegister, auth_controller_1.default.register);
router.post("/login", userValidator_1.validateLogin, auth_controller_1.default.login);
router.post("/forgot-password", userValidator_1.validateForgotPassword, auth_controller_1.default.forgotPassword);
router.post("/reset-password", userValidator_1.validateResetPassword, auth_controller_1.default.resetPassword);
router.post("/logout", auth_controller_1.default.logout);
exports.default = router;
