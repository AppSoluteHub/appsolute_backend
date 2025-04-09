"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userTask_controller_1 = require("../controllers/userTask.controller");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
// import authenticate from "../../../middlewares/auth.middleware";
const router = (0, express_1.Router)();
router.post("/answer/:taskId", auth_middleware_1.default, userTask_controller_1.answerTaskHandler);
exports.default = router;
