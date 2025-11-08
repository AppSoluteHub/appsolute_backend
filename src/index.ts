
import express, { NextFunction, Request, Response } from "express";
import { Router } from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import baseRoutes from "./features/appRoute";
import setupSwagger from "./swagger/swagger";
import session from "express-session";
import passport from "passport";
import googleRoute from "./middlewares/auth.google.middleware";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error.middleware";
import http from "http";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app); 


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // "http://localhost:3002",
  "https://appsolutehub.com",
 "https://appsolute.vercel.app",
  "https://appsolutehub.vercel.app",
  "https://app-solute-hub-app.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



app.use(cookieParser());





app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/", googleRoute);

const router = Router();
const rootRouter = baseRoutes(router);
app.use("/api/v1", rootRouter);

app.use(errorHandler);


setupSwagger(app);


server.listen(port, () => console.log(`🚀 Server is running on port ${port}`));

export default app;
