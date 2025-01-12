"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authenticate;
const jwt_1 = require("../utils/jwt");
function authenticate(req, res, next) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        res.status(401).json({ success: false, message: "No token provided" });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded.userId;
        next();
    }
    catch (err) {
        res
            .status(401)
            .json({ success: false, message: "Invalid or expired token" });
    }
}
