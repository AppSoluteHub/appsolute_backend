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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController = __importStar(require("../controllers/review.controller"));
const validateRequest_1 = require("../../../middlewares/validateRequest");
const review_dto_1 = require("../dto/review.dto");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
// Route to create a review for a specific product
router.post('/:productId/reviews', auth_middleware_1.default, (0, validateRequest_1.validateRequest)(review_dto_1.createReviewDto), reviewController.createReview);
// Route to get all reviews (with optional filtering by productId or userId)
router.get('/reviews', reviewController.getAllReviews);
// Route to get a single review by ID
router.get('/reviews/:id', reviewController.getReviewById);
// Route to update a review (only the creator or admin should be able to update)
// For simplicity, I'm adding authenticate here. Further authorization logic (creator/admin) can be added in controller/middleware.
router.patch('/reviews/:id', auth_middleware_1.default, (0, validateRequest_1.validateRequest)(review_dto_1.updateReviewDto), reviewController.updateReview);
// Route to delete a review (only the creator or admin should be able to delete)
// For simplicity, I'm adding authenticate here. Further authorization logic (creator/admin) can be added in controller/middleware.
router.delete('/reviews/:id', auth_middleware_1.default, reviewController.deleteReview);
exports.default = router;
