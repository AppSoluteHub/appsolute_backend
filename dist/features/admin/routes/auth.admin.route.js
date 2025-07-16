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
const userValidator_1 = require("../../../validators/userValidator");
const auth_middleware_1 = __importStar(require("../../../middlewares/auth.middleware"));
const auth_controller_1 = __importDefault(require("../../authenetication/controllers/auth.controller"));
const user_controller_1 = require("../../users/user.controller");
const router = express_1.default.Router();
router.post("/admin-login", auth_middleware_1.default, auth_middleware_1.isAdmin, userValidator_1.validateLogin, auth_controller_1.default.login);
router.post("/admin-register", auth_middleware_1.default, auth_middleware_1.isAdmin, auth_controller_1.default.register);
router.post("/admin-logout", auth_middleware_1.default, auth_middleware_1.isAdmin, auth_controller_1.default.logout);
router.get("/allUsers", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.getUsers);
router.get("/roles", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.getAdmins);
router.patch("/update/:userId", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.updateUser);
router.get("/allUsers/:userId", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.getUserById);
router.delete("/delete/:userId", auth_middleware_1.default, auth_middleware_1.isAdmin, user_controller_1.UserController.deleteUser);
exports.default = router;
