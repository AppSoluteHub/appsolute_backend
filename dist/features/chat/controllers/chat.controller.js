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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = exports.startChat = void 0;
const chatService = __importStar(require("../services/chat.service"));
const chat_dto_1 = require("../dto/chat.dto");
const startChat = async (req, res) => {
    try {
        const validatedData = chat_dto_1.StartChatSchema.parse(req.body);
        const session = await chatService.startChatSession(validatedData);
        res.status(201).json({
            status: 'success',
            data: { session },
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message || 'Invalid input',
        });
    }
};
exports.startChat = startChat;
const sendMessage = async (req, res) => {
    try {
        const validatedData = chat_dto_1.SendMessageSchema.parse(req.body);
        const response = await chatService.processUserMessage(validatedData.sessionId, validatedData.message);
        res.status(200).json({
            status: 'success',
            data: response,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            status: 'error',
            message: error.message || 'Something went wrong',
        });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await chatService.getSessionMessages(sessionId);
        res.status(200).json({
            status: 'success',
            data: { messages },
        });
    }
    catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message || 'Session not found',
        });
    }
};
exports.getMessages = getMessages;
