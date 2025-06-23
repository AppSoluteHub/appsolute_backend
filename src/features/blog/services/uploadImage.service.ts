interface ImageData {
  imageUrl: string;
  createdAt: Date;
}

class ImageService {
  async createImage(imageUrl: string): Promise<ImageData> {
    return {
      imageUrl,
      createdAt: new Date(),
    };
  }
}

export const imageService = new ImageService();
