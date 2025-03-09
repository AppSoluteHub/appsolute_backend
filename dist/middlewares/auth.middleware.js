"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.isAdmin = void 0;
exports.default = authenticate;
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function authenticate(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid user." });
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch (err) {
        res
            .status(401)
            .json({ success: false, message: "Invalid or expired token" });
    }
}
const isAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
        return;
    }
    const { role } = req.user;
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
        res.status(403).json({ success: false, message: "Access denied: Admins only" });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
const isSuperAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
        return;
    }
    const { role } = req.user;
    if (role !== "SUPERADMIN") {
        res.status(403).json({ success: false, message: "Access denied: Superadmins only" });
        return;
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
