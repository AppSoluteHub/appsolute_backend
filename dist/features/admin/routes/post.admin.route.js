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
const auth_middleware_1 = __importStar(require("../../../middlewares/auth.middleware"));
const multer_1 = __importDefault(require("multer"));
const post_admin_controller_1 = __importDefault(require("../controllers/post.admin.controller"));
const validateRequest_1 = require("../../../middlewares/validateRequest");
const validateFile_1 = require("../../../middlewares/validateFile");
const post_validator_1 = require("../../../validators/post.validator");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post("/create", auth_middleware_1.default, auth_middleware_1.isAdmin, upload.single("file"), validateFile_1.validateFile, (0, validateRequest_1.validateRequest)(post_validator_1.createPostSchema), post_admin_controller_1.default.createPost);
router.get("/posts", post_admin_controller_1.default.getAllPosts);
router.get("/posts/:id", post_admin_controller_1.default.getPostById);
router.delete("/posts/:id", auth_middleware_1.default, auth_middleware_1.isAdmin, post_admin_controller_1.default.deletePost);
router.patch("/posts/:id", auth_middleware_1.default, auth_middleware_1.isAdmin, upload.single("file"), validateFile_1.validateFile, (0, validateRequest_1.validateRequest)(post_validator_1.updatePostSchema), post_admin_controller_1.default.updatePost);
exports.default = router;
