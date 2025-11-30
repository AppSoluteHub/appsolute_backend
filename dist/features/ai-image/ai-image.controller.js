"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiImageController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const ai_image_service_1 = require("./ai-image.service");
class AiImageController {
}
exports.AiImageController = AiImageController;
_a = AiImageController;
AiImageController.generateImage = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
    const generatedImage = await ai_image_service_1.AiImageService.transformImage(prompt, image, userId);
    res.status(200).json({
        status: 'success',
        data: generatedImage,
    });
});
