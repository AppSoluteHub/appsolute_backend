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
exports.createOrderController = exports.getOrderByIdController = exports.getOrdersController = void 0;
const orderService = __importStar(require("../services/order.services"));
const order_validator_1 = require("../../../validators/order.validator");
const appError_1 = require("../../../lib/appError");
const getOrdersController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const orders = await orderService.getOrders(userId);
        res.json(orders);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrdersController = getOrdersController;
const getOrderByIdController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const { orderId } = req.params;
        const order = await orderService.getOrderById(userId, orderId);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderByIdController = getOrderByIdController;
const createOrderController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const { error, value } = order_validator_1.createOrderSchema.validate(req.body);
        if (error) {
            throw new appError_1.AppError(error.details[0].message, 400);
        }
        const order = await orderService.createOrder(userId, value.billingAddress);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.createOrderController = createOrderController;
