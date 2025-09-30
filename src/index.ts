
import express from "express";
import { Router } from "express";
import bodyParser from "body-parser";
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

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));



const allowedOrigins = [
  // "http://localhost:3000",
  // "http://localhost:3001",
  // "http://localhost:3002",
  "https://appsolutehub.com",
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
app.use(express.json());

const storage = multer.memoryStorage();
export const upload = multer({ storage });

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
