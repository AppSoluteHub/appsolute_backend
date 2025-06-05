// import axios from "axios";
// import { BadRequestError } from "../lib/appError";
// import * as cheerio from "cheerio";


// export const extractYouTubeID =(url: string): string =>{
//   const regex =
//     /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
//   const match = url.match(regex);
//   if (!match) {
//     throw new BadRequestError("Invalid YouTube URL");
//   }
//   return match[1];
// }

// // fetches title via Data API and constructs the thumbnail URL
// export async function fetchYouTubeDetails(videoUrl: string) {
//   const videoId = extractYouTubeID(videoUrl);
//   const apiKey = process.env.YOUTUBE_API_KEY;
//   if (!apiKey) {
//     throw new Error("YouTube API key not configured");
//   }

//   // 1) Get title from YouTube Data API
//   const response = await axios.get(
//     "https://www.googleapis.com/youtube/v3/videos",
//     {
//       params: { part: "snippet", id: videoId, key: apiKey },
//     }
//   );

//   const items = response.data.items;
//   if (!Array.isArray(items) || items.length === 0) {
//     throw new BadRequestError("Video not found on YouTube");
//   }

//   const title = items[0].snippet.title as string;

//   // 2) Construct the standard YouTube thumbnail URL
//   const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

//   return { title, thumbnailUrl };
// }




// export async function extractMetaFromUrl(url: string): Promise<{ title: string; image: string }> {
//   try {
//     if (url.includes("youtube.com") || url.includes("youtu.be")) {
//       const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
//       const videoId = videoIdMatch ? videoIdMatch[1] : null;

//       if (!videoId) throw new Error("Invalid YouTube URL");

//       const videoData = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
//       const { title, thumbnail_url } = videoData.data;
//       return { title, image: thumbnail_url };
//     } else {
//       const response = await axios.get(url);
//       const $ = cheerio.load(response.data);

//       const title =
//         $("meta[property='og:title']").attr("content") ||
//         $("title").text() ||
//         "Untitled";

//       const image =
//         $("meta[property='og:image']").attr("content") ||
//         $("img").first().attr("src") ||
//         "";

//       return { title, image };
//     }
//   } catch (err: any) {
//     console.error("Failed to extract metadata from URL:", err.message);
//     throw new Error("Could not extract title and image from the provided URL");
//   }
// }


import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

export async function extractMetaFromUrl(
  url: string
): Promise<{ title: string; image: string }> {
  try {
    // Special handling for YouTube URLs
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) throw new Error("Invalid YouTube URL");

      const videoData = await axios.get(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const { title, thumbnail_url } = videoData.data;
      return { title, image: thumbnail_url };
    }

    // General URL case
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("meta[name='twitter:title']").attr("content") ||
      $("title").text().trim() ||
      "Untitled";

    let image =
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content") ||
      $("img").first().attr("src") ||
      "";

    // Resolve relative image URLs
    if (image && !image.startsWith("http")) {
      const baseUrl = new URL(url);
      image = `${baseUrl.origin}${image.startsWith("/") ? image : "/" + image}`;
    }

    return { title, image };
  } catch (err: any) {
    console.error("Failed to extract metadata from URL:", err.message);
    throw new Error("Could not extract title and image from the provided URL");
  }
}

