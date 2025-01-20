import express, { Request, Response } from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
  }),
  (req: Request, res: Response) => {
    res.redirect("/success");
  }
);

router.get("/success", (req: Request, res: Response) => {
  res.send(`Welcome to Appsolute, ${req.user ? req.user : "Guest"}!`);
});

router.get("/failed", (req: Request, res: Response) => {
  res.send(
    "Failed to authenticate with Appsolute using Gmail. Please try again."
  );
});

router.get("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Failed to logout");
    }
    res.redirect("/");
  });
});

export default router;
