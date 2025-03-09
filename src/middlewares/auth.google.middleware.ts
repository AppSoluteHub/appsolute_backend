import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt";

dotenv.config();

const prisma = new PrismaClient();

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

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "GUEST" | "SUPERADMIN";
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done) => {
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
        console.log(user, "NewUSer")

        return done(null, {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        });
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: Express.User, done) => {
  done(null, obj);
});

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


const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);



router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    const token = generateToken ((req.user as User).id);
    res.cookie("token", token, {  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.redirect(" http://localhost:3001/dashboard");
   
  }
);

router.get("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;

