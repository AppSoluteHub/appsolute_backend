import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { createReviewDto, updateReviewDto } from '../dto/review.dto';
import authenticate from '../../../middlewares/auth.middleware';

const router = Router();

router.post('/:productId/reviews', authenticate, validateRequest(createReviewDto), reviewController.createReview);
router.get('/reviews', reviewController.getAllReviews);
router.get('/reviews/:id', reviewController.getReviewById);
router.patch('/reviews/:id', authenticate, validateRequest(updateReviewDto), reviewController.updateReview);
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

export default router;