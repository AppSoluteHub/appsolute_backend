"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeVideosKids = exports.getYouTubeVideos = void 0;
const content_service_1 = require("../services/content.service");
const getYouTubeVideos = async (req, res) => {
    try {
        const videos = await (0, content_service_1.fetchYouTubeVideos)();
        res.status(200).json({ success: true, data: videos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching videos', error: error });
    }
};
exports.getYouTubeVideos = getYouTubeVideos;
const getYouTubeVideosKids = async (req, res) => {
    try {
        const videos = await (0, content_service_1.fetchYouTubeVideosKids)();
        res.status(200).json({ success: true, data: videos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching videos', error: error });
    }
};
exports.getYouTubeVideosKids = getYouTubeVideosKids;
