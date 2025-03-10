"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "http://localhost:3000/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findUnique({
            where: { email: profile.emails?.[0].value || "" },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    fullName: profile.displayName,
                    email: profile.emails?.[0].value || "",
                    role: "GUEST",
                    password: "password",
                    profileImage: profile.photos?.[0].value || null,
                },
            });
        }
        console.log(user, "NewUSer");
        return done(null, {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        });
    }
    catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};
const router = express_1.default.Router();
router.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    const token = (0, jwt_1.generateToken)(req.user.id);
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.redirect("/dashboard");
});
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});
exports.default = router;
