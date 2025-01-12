"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const multer_1 = __importDefault(require("multer"));
const appRoute_1 = __importDefault(require("./features/appRoute"));
const swagger_1 = __importDefault(require("./swagger/swagger"));
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage });
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));
const router = (0, express_2.Router)();
const rootRouter = (0, appRoute_1.default)(router);
app.use("/api/v1", rootRouter);
(0, swagger_1.default)(app);
app.listen(port, () => console.log(`🚀 Server is firing on port ${port}`));
exports.default = app;
