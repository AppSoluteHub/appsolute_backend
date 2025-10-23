"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createOrderSchema = joi_1.default.object({
    billingAddress: joi_1.default.object({
        fullName: joi_1.default.string().required(),
        lastName: joi_1.default.string().required(),
        company: joi_1.default.string().optional(),
        country: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        zip: joi_1.default.string().required(),
        phone: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        address: joi_1.default.string().required(),
        note: joi_1.default.string().optional(),
    }).required(),
});
