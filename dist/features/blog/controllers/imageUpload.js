"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const appError_1 = require("../../../lib/appError");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const uploadImage_service_1 = require("../services/uploadImage.service");
class ImageController {
    static async uploadImage(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new appError_1.UnAuthorizedError("Unauthorized");
            if (!req.file)
                throw new appError_1.BadRequestError("No image file provided");
            const file = req.file;
            const imageUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "AppSoluteImages" }, (err, result) => {
                    if (err || !result) {
                        return reject(new appError_1.BadRequestError("Image upload failed"));
                    }
                    resolve(result.secure_url);
                });
                uploadStream.end(file.buffer);
            });
            const data = await uploadImage_service_1.imageService.createImage(imageUrl);
            res.status(201).json({
                success: true,
                message: "Image uploaded successfully",
                data,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ImageController = ImageController;
