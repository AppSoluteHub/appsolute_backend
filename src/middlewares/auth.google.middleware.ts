import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

import dotenv from 'dotenv'
dotenv.config();

declare global {
  namespace Express {
    interface User {
      id: string;
      fullName: string;
      email: string;
      role: "ADMIN" | "GUEST" | "SUPERADMIN";
    }
  }
}

// Define the User interface
interface User {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "GUEST" | "SUPERADMIN";
}

// Google Strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken: string, refreshToken: string, profile: Profile, done) => {
      // Example mapping of Google profile to User interface
      const user: User = {
        id: profile.id,
      fullName: profile.displayName,
        email: profile.emails?.[0].value || "",
        role: "GUEST", // Default role; customize as needed
      };
      return done(null, user);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: Express.User, done) => {
  done(null, obj);
});

// Middleware to check authentication
const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

// Routes
const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    res.redirect("/profile");
  }
);

router.get("/profile", isAuthenticated, (req: Request, res: Response) => {
  const user = req.user as User; 
  res.send(`Welcome ${user.fullName}`);
});

router.get("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;
