"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appRoute_1 = __importDefault(require("./features/appRoute"));
const swagger_1 = __importDefault(require("./swagger/swagger"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const auth_google_middleware_1 = __importDefault(require("./middlewares/auth.google.middleware"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_middleware_1 = require("./middlewares/error.middleware");
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const server = http_1.default.createServer(app);
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    // "http://localhost:3002",
    "https://appsolutehub.com",
    "https://appsolutehub.vercel.app",
    "https://app-solute-hub-app.vercel.app",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS: " + origin));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/", auth_google_middleware_1.default);
const router = (0, express_2.Router)();
const rootRouter = (0, appRoute_1.default)(router);
app.use("/api/v1", rootRouter);
app.use(error_middleware_1.errorHandler);
(0, swagger_1.default)(app);
server.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
exports.default = app;
