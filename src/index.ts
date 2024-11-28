import express, { Request, Response } from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import multer from "multer";
import baseRoutes from "./features/appRoute";
import setupSwagger from "./swagger/swagger";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(express.json());


// Multer Configuration
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Routes
const router = Router();
const rootRouter = baseRoutes(router);
app.use("/api/v1", rootRouter);

// Swagger Documentation
setupSwagger(app);

// Server Listener
app.listen(PORT, () => {
  console.log(`🚀 Server is firing on port ${PORT}`);
});

export default app;
