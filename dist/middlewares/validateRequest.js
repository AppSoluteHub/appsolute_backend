"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const appError_1 = require("../lib/appError");
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
            throw new appError_1.BadRequestError(errorMessage);
        }
        next();
    };
};
exports.validateRequest = validateRequest;
