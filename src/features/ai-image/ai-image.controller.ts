
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AiImageService } from './ai-image.service';




export class AiImageController {
    static generateImage = catchAsync(async (req: Request, res: Response) => {
        const { prompt } = req.body;
        const image = req.file;
        const userId = req.user?.id; 

        if (!image) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ 
                status: 'error',
                message: 'Prompt is required' 
            });
        }
        const generatedImage = await AiImageService.transformImage(prompt, image, userId);

        res.status(200).json({
            status: 'success',
            data: generatedImage,
        });
    });
}
