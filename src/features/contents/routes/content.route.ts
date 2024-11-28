import { Router } from "express";
import ContentController from "../controllers/content.controller";

const router = Router();

// // Public routes (no authentication required)
// router.get("/content", ContentController.getAllContent); 
// router.get("/content/:id", ContentController.getContentById); 

// // Protected routes (authentication required)
// router.post("/content", ContentController.createContent); 
// router.put("/content/:id", ContentController.updateContent); 
// router.delete("/content/:id",  ContentController.deleteContent); 

export default router;
