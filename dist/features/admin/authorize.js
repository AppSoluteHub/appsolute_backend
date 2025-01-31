"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = authorizeRole;
function authorizeRole(requiredRole) {
    return (req, res, next) => {
        if (req.user?.role !== requiredRole) {
            res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
            return;
        }
        next();
    };
}
