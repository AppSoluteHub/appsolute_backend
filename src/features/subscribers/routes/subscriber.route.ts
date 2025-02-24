
import express from "express";
import SubscriberController from "../controllers/subscriber.controller";

const router = express.Router();

router.post("/", SubscriberController.subscribe);

export default router;
