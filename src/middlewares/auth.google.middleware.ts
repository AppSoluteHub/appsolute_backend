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
      callbackURL: "https://appsolute-api-1.onrender.com/auth/google/callback", 
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

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req: Request, res: Response) => {
//     if (!req.user) {
//        res.status(401).json({ message: "Authentication failed" });
//        return;
//     }

//     const user = req.user as User;
//     console.log("User", user);
//     const token = generateToken(user.id);

//     res.json({
//       message: "Authentication successful",
//       token,
//       user: {
//         id: user.id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   }
// );

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect("https://appsolutehub.vercel.app/login?error=AuthenticationFailed");
    }

    const user = req.user as User;
    console.log("User", user);
    const token = generateToken(user.id);

    
    res.redirect(`https://appsolutehub.vercel.app/dashboard?token=${token}&userId=${user.id}`);
  }
);

router.get("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
