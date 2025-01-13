"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateLogin = exports.validateRegister = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRegister = (req, res, next) => {
    const schema = joi_1.default.object({
        fullName: joi_1.default.string().min(3).max(50).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
const validateForgotPassword = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateForgotPassword = validateForgotPassword;
const validateResetPassword = (req, res, next) => {
    const schema = joi_1.default.object({
        password: joi_1.default.string().min(8).required(),
        otp: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    next();
};
exports.validateResetPassword = validateResetPassword;
