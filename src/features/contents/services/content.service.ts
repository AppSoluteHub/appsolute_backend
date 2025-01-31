import axios from "axios";
import { BadRequestError, InternalServerError } from "../../../lib/appError";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!API_KEY || !CHANNEL_ID) {
  throw new BadRequestError("Missing API_KEY or CHANNEL_ID in environment variables.");
}

export const fetchYouTubeVideos = async () => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          channelId: CHANNEL_ID,
          maxResults: 10,
          order: "date",
          key: API_KEY,
        },
      }
    );
   
    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new InternalServerError("Something went wrong fetching youtube channel contents");
  }
};
