"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = __importStar(require("../../middlewares/auth.middleware"));
const userValidator_1 = require("../../validators/userValidator");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.get("/", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.getUsers);
router.get("/allAdmins", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.getAdmins);
router.get("/roles", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.getRoles);
router.get("/:userId", auth_middleware_1.default, user_controller_1.UserController.getUserById);
router.delete("/:userId", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.deleteUser);
// router.patch("/:userId",authenticate, validateUpdateUser, UserController.updateUser);
router.patch("/role", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.updateUserRole);
router.patch("/profile/:userId", auth_middleware_1.default, upload.single("file"), user_controller_1.UserController.updateProfileImage);
router.patch("/:userId", auth_middleware_1.default, userValidator_1.validateUpdateUser, user_controller_1.UserController.updateUser);
exports.default = router;
