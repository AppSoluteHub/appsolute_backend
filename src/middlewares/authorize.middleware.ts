import passport, { Profile } from "passport";
import dotenv from "dotenv";
dotenv.config();

import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Application, Request } from "express";


function googleAuthMiddleware(app: Application): void {

  passport.serializeUser((user: Express.User, done: (err: any, id?: any) => void) => {
    done(null, user);
  });

 
  passport.deserializeUser((user: Express.User, done: (err: any, user?: Express.User) => void) => {
    done(null, user);
  });

 
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || "",
        callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL || "",
        passReqToCallback: true,
      },
      function (
        request: Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: Express.User) => void
      ) {
        return done(null, profile);
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());
}

export default googleAuthMiddleware;
