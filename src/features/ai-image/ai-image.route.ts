import { Router } from "express";
import { AiImageController } from "./ai-image.controller";
import multer from "multer";
import authenticate from "../../middlewares/auth.middleware";



const router = Router();


const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});


router.post(
    '/generate',
    authenticate, 
    upload.single('image'),
    AiImageController.generateImage
);

export default router;