"use strict";
// import axios from "axios";
// import { BadRequestError } from "../lib/appError";
// import * as cheerio from "cheerio";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMetaFromUrl = extractMetaFromUrl;
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
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const url_1 = require("url");
async function extractMetaFromUrl(url) {
    try {
        // Special handling for YouTube URLs
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            if (!videoId)
                throw new Error("Invalid YouTube URL");
            const videoData = await axios_1.default.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const { title, thumbnail_url } = videoData.data;
            return { title, image: thumbnail_url };
        }
        // General URL case
        const response = await axios_1.default.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml",
            },
            timeout: 10000,
        });
        const $ = cheerio.load(response.data);
        const title = $("meta[property='og:title']").attr("content") ||
            $("meta[name='twitter:title']").attr("content") ||
            $("title").text().trim() ||
            "Untitled";
        let image = $("meta[property='og:image']").attr("content") ||
            $("meta[name='twitter:image']").attr("content") ||
            $("img").first().attr("src") ||
            "";
        // Resolve relative image URLs
        if (image && !image.startsWith("http")) {
            const baseUrl = new url_1.URL(url);
            image = `${baseUrl.origin}${image.startsWith("/") ? image : "/" + image}`;
        }
        return { title, image };
    }
    catch (err) {
        console.error("Failed to extract metadata from URL:", err.message);
        throw new Error("Could not extract title and image from the provided URL");
    }
}
