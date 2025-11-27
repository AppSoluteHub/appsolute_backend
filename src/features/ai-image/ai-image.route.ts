
import { Router } from 'express';
import { AiImageController } from './ai-image.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post(
    '/generate',
    upload.single('image'),
    AiImageController.generateImage
);

export default router;
