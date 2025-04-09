"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const userValidator_1 = require("../../validators/userValidator");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const router = express_1.default.Router();
router.get("/", user_controller_1.UserController.getUsers);
router.get("/:userId", user_controller_1.UserController.getUserById);
router.delete("/:userId", user_controller_1.UserController.deleteUser);
router.patch("/:userId", auth_middleware_1.default, userValidator_1.validateUpdateUser, user_controller_1.UserController.updateUser);
router.patch("/profile/:userId", auth_middleware_1.default, upload.single("file"), user_controller_1.UserController.updateProfileImage);
exports.default = router;
