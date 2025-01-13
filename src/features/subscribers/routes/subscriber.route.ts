import express from "express";
import { ContactController } from "../controllers/subscriber.controller";

const router = express.Router();
const contactController = new ContactController();
router.post("/contact", (req, res) => contactController.sendMessage(req, res));

export default router;
