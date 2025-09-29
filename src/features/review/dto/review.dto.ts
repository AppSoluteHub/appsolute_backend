import joi from 'joi';
export const createReviewDto = joi.object({
  rating: joi.number().integer().min(1).max(5).optional().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'number.integer': 'Rating must be an integer',
    'any.required': 'Rating is required'
  }),
  comment: joi.string().min(1).required().messages({
    'string.empty': 'Comment is required',
    'any.required': 'Comment is required'
  }),
 
});

export const updateReviewDto = joi.object({
  rating: joi.number().integer().min(1).max(5).optional().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'number.integer': 'Rating must be an integer'
  }),
  comment: joi.string().min(1).optional().messages({
    'string.empty': 'Comment is required'
  }),
});