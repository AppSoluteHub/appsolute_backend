import express from "express";
import { UserBehaviorController } from "./controller";

const userBehaviourRoutes = express.Router();

userBehaviourRoutes.post(
  "/track",
  UserBehaviorController.trackInteraction
);

export default userBehaviourRoutes;
