import express, { Request, Response } from "express";
import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import baseRoutes from "./features/appRoute";
import setupSwagger from "./swagger/swagger";
import session from "express-session";
import passport from "passport";
import googleRoute from "./middlewares/auth.google.middleware"
// import googleRouter from "./google.route";
const app = express();
const port = process.env.PORT;

// Setup express-session for storing session data (if you're using sessions)
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
//     cookie: { secure: false },

  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/", googleRoute )


// googleAuthMiddleware(app)
const router = Router();
const rootRouter = baseRoutes(router);
app.use("/", rootRouter);


setupSwagger(app);

app.listen(port, () => console.log(`🚀 Server is firing on port ${port}`));

export default app;
