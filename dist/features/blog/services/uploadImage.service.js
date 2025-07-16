"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageService = void 0;
class ImageService {
    async createImage(imageUrl) {
        return {
            imageUrl,
            createdAt: new Date(),
        };
    }
}
exports.imageService = new ImageService();
