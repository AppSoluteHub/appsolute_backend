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
exports.rateProduct = void 0;
const ratingService = __importStar(require("../services/rating.service"));
const joi_1 = __importDefault(require("joi"));
const rateProductSchema = joi_1.default.object({
    value: joi_1.default.number().integer().min(1).max(5).required(),
    userId: joi_1.default.string().uuid().required(),
});
const rateProduct = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { error, value } = rateProductSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                status: 'fail',
                message: error.details[0].message,
            });
            return;
        }
        const product = await ratingService.rateProduct({
            productId,
            userId: value.userId,
            value: value.value,
        });
        res.status(200).json({
            status: 'success',
            data: { product },
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
exports.rateProduct = rateProduct;
