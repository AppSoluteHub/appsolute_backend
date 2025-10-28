"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getAllReviews = exports.createReview = void 0;
const reviewService = __importStar(require("../services/review.service"));
const appError_1 = require("../../../lib/appError");
const createReview = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const reviewData = {
            ...req.body,
            productId,
            userId,
        };
        const review = await reviewService.createReview(reviewData);
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const getAllReviews = async (req, res, next) => {
    try {
        const { page, limit, productId, userId } = req.query;
        const options = {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            productId: productId ? productId : undefined,
            userId: userId,
        };
        const reviews = await reviewService.getAllReviews(options);
        res.status(200).json({ success: true, data: reviews });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReviews = getAllReviews;
const getReviewById = async (req, res, next) => {
    try {
        const review = await reviewService.getReviewById(req.params.id);
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewById = getReviewById;
const updateReview = async (req, res, next) => {
    try {
        const review = await reviewService.updateReview(req.params.id, req.body);
        res.status(200).json({ success: true, data: review });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    try {
        await reviewService.deleteReview(req.params.id);
        res.status(204).json({ success: true, data: null });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
