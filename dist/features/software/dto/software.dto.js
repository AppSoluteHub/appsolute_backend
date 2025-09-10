"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSoftwareDto = exports.createSoftwareDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createSoftwareDto = joi_1.default.object({
    title: joi_1.default.string().min(3).required(),
    description: joi_1.default.string(),
    downloadUrl: joi_1.default.string().uri(),
    category: joi_1.default.string(),
    bgColor: joi_1.default.string(),
    image: joi_1.default.string(),
});
exports.updateSoftwareDto = joi_1.default.object({
    title: joi_1.default.string().min(3),
    description: joi_1.default.string(),
    downloadUrl: joi_1.default.string().uri(),
    category: joi_1.default.string(),
    bgColor: joi_1.default.string(),
    image: joi_1.default.string(),
});
