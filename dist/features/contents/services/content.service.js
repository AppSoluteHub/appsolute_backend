"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchYouTubeVideos = void 0;
const axios_1 = __importDefault(require("axios"));
const appError_1 = require("../../../lib/appError");
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
if (!API_KEY || !CHANNEL_ID) {
    throw new appError_1.BadRequestError("Missing API_KEY or CHANNEL_ID in environment variables.");
}
const fetchYouTubeVideos = async () => {
    try {
        const response = await axios_1.default.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                channelId: CHANNEL_ID,
                maxResults: 10,
                order: "date",
                key: API_KEY,
            },
        });
        return response.data.items.map((item) => ({
            id: item.id.videoId,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: item.snippet.publishedAt,
        }));
    }
    catch (error) {
        console.error("Error fetching videos:", error);
        throw new appError_1.InternalServerError("Something went wrong fetching youtube channel contents");
    }
};
exports.fetchYouTubeVideos = fetchYouTubeVideos;
