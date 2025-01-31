"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const manageUser_controller_1 = require("../controllers/manageUser.controller");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const authorize_1 = require("../authorize");
const router = (0, express_1.Router)();
router.post("/add-admin", auth_middleware_1.default, (0, authorize_1.authorizeRole)("SUPERADMIN"), manageUser_controller_1.AdminController.addAdmin);
router.post("/remove-admin", auth_middleware_1.default, (0, authorize_1.authorizeRole)("SUPERADMIN"), manageUser_controller_1.AdminController.removeAdmin);
exports.default = router;
