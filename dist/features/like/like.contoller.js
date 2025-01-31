"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeController = void 0;
const like_services_1 = require("./like.services");
const likeService = new like_services_1.LikeService();
class LikeController {
    constructor() {
    }
    async like(req, res) {
        try {
            const userId = req.user?.id;
            const { postId } = req.params;
            const newLike = await likeService.likePost(userId, postId);
            res.status(201).json(newLike);
        }
        catch (error) {
            console.error("Error liking post:", error);
            res.status(500).json({ error: "Failed to like post" });
        }
    }
    async unlike(req, res) {
        try {
            const userId = req.user?.id;
            const { postId } = req.params;
            const response = await likeService.unlikePost(userId, postId);
            res.status(200).json(response);
        }
        catch (error) {
            console.error("Error unliking post:", error);
            res.status(500).json({ error: "Failed to unlike post" });
        }
    }
}
exports.LikeController = LikeController;
