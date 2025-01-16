import express from "express";
import { getYouTubeVideos } from "../controllers/content.controller";

const router = express.Router();

router.get("/videos", getYouTubeVideos);

export default router;
