"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const like_contoller_1 = require("./like.contoller");
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const likeRouter = (0, express_1.Router)();
const likeController = new like_contoller_1.LikeController();
likeRouter.post("/:postId", auth_middleware_1.default, likeController.like);
likeRouter.delete("/:postId", auth_middleware_1.default, likeController.unlike);
exports.default = likeRouter;
