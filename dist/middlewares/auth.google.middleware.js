"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Google Strategy setup
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: "http://localhost:3000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    // Example mapping of Google profile to User interface
    const user = {
        id: profile.id,
        fullName: profile.displayName,
        email: profile.emails?.[0].value || "",
        role: "GUEST", // Default role; customize as needed
    };
    return done(null, user);
}));
// Serialize and deserialize user
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};
// Routes
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("<a href='/auth/google'>Login with Google</a>");
});
router.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/profile");
});
router.get("/profile", isAuthenticated, (req, res) => {
    const user = req.user;
    res.send(`Welcome ${user.email}`);
});
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});
exports.default = router;
