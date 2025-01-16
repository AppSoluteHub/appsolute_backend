
import { Request, Response } from 'express';
import { fetchYouTubeVideos } from '../services/content.service';

export const getYouTubeVideos = async (req: Request, res: Response) => {
    try {
        const videos = await fetchYouTubeVideos();
        res.status(200).json({ success: true, data: videos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching videos', error: error });
    }
};
