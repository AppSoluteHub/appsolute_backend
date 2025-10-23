"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePaymentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const initiatePaymentSchema = joi_1.default.object({
    orderId: joi_1.default.string().required(),
    amount: joi_1.default.number()
        .positive()
        .required()
        .custom((value, helpers) => {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            return helpers.error('amount.precision');
        }
        return value;
    })
        .messages({
        'amount.precision': 'Amount must have at most 2 decimal places',
        'number.positive': 'Amount must be a positive number'
    }),
    email: joi_1.default.string().email().required()
});
exports.initiatePaymentSchema = initiatePaymentSchema;
