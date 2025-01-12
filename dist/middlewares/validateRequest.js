"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateRequest = (req, res, next) => {
    if (!req.body)
        return res.status(400).json({ error: "Invalid request data" });
    next();
};
exports.default = validateRequest;
