import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createReviewDto, updateReviewDto } from '../dto/review.dto';
import authenticate from '../../../middlewares/auth.middleware';

const router = Router();

// Route to create a review for a specific product
router.post('/:productId/reviews', authenticate, validateRequest(createReviewDto), reviewController.createReview);

// Route to get all reviews (with optional filtering by productId or userId)
router.get('/reviews', reviewController.getAllReviews);

// Route to get a single review by ID
router.get('/reviews/:id', reviewController.getReviewById);

// Route to update a review (only the creator or admin should be able to update)
// For simplicity, I'm adding authenticate here. Further authorization logic (creator/admin) can be added in controller/middleware.
router.patch('/reviews/:id', authenticate, validateRequest(updateReviewDto), reviewController.updateReview);

// Route to delete a review (only the creator or admin should be able to delete)
// For simplicity, I'm adding authenticate here. Further authorization logic (creator/admin) can be added in controller/middleware.
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

export default router;