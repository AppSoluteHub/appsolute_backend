"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// // Public routes (no authentication required)
// router.get("/content", ContentController.getAllContent); 
// router.get("/content/:id", ContentController.getContentById); 
// // Protected routes (authentication required)
// router.post("/content", ContentController.createContent); 
// router.put("/content/:id", ContentController.updateContent); 
// router.delete("/content/:id",  ContentController.deleteContent); 
exports.default = router;
