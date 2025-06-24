import express from "express";
import { UserBehaviorController } from "./controller";
import authenticate from "../../middlewares/auth.middleware";

const userBehaviourRoutes = express.Router();

userBehaviourRoutes.post(
  "/track",
  authenticate,
  UserBehaviorController.trackInteraction
);

export default userBehaviourRoutes;
