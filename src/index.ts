import express, { Request, Response } from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import multer from "multer";
import baseRoutes from "./features/appRoute";
import setupSwagger from "./swagger/swagger";
// import googleAuthMiddleware from "./middlewares/authorize.middleware";


const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
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
    cookie: { secure: false },
  })
);
// googleAuthMiddleware(app)
const router = Router();
const rootRouter = baseRoutes(router);
app.use("/api/v1", rootRouter);

setupSwagger(app);

app.listen(port, () => console.log(`🚀 Server is firing on port ${port}`));

export default app;
