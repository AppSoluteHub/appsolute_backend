"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatResponseSchema = exports.SendMessageSchema = exports.StartChatSchema = void 0;
const zod_1 = require("zod");
exports.StartChatSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string().min(2),
    deviceInfo: zod_1.z.string().optional(),
});
exports.SendMessageSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1),
});
exports.ChatResponseSchema = zod_1.z.object({
    reply: zod_1.z.string(),
    recommendedProducts: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        price: zod_1.z.number(),
        url: zod_1.z.string(),
    })).optional(),
});
