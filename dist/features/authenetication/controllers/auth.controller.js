"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const jwt_1 = require("../../../utils/jwt");
const appResponse_1 = __importDefault(require("../../../lib/appResponse"));
const appError_1 = require("../../../lib/appError");
class AuthController {
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fullName, email, password, profileImage } = req.body;
                const newUser = yield auth_service_1.default.register({
                    fullName,
                    email,
                    profileImage,
                    password,
                });
                res.send((0, appResponse_1.default)("User registered successfully", newUser));
            }
            catch (error) {
                next(error);
                console.log(error);
            }
        });
    }
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { user } = yield auth_service_1.default.login(email, password);
                const token = (0, jwt_1.generateToken)(user.id);
                const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });
                res.status(200).json({ message: "Login successful", token, user });
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    static forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield auth_service_1.default.forgotPassword(email);
                res.send((0, appResponse_1.default)("Message:", result));
            }
            catch (error) {
                next(error);
            }
        });
    }
    static resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, otp } = req.body;
                console.log("controller passwprd");
                if (!otp || !password)
                    throw new appError_1.BadRequestError("Otp and password are required");
                const result = yield auth_service_1.default.resetPassword(otp, password);
                res.send((0, appResponse_1.default)("message:", result));
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    static logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                if (!token) {
                    throw new Error("Token not provided");
                }
                const result = yield auth_service_1.default.logout(token);
                res.send((0, appResponse_1.default)("Message:", result));
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AuthController;
