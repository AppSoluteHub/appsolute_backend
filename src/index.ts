
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
// import { initializeSocket } from "./config/websocket";
// import { connectRedis } from "./config/redis";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app); 


// connectRedis();
// initializeSocket(server);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: ["http://localhost:3001","https://appsolutehub.vercel.app"],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );

// app.options("*", cors());


app.use(cors());


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

// Start Server
server.listen(port, () => console.log(`🚀 Server is running on port ${port}`));

export default app;
