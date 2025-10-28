import Joi from 'joi';

const ratingSchema = Joi.number()
  .integer()
  .min(1)
  .max(5)
  .messages({
    'number.base': 'Rating must be a number',
    'number.integer': 'Rating must be an integer',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
  });

export const createReviewDto = Joi.object({
  rating: ratingSchema.required().messages({
    'any.required': 'Rating is required',
  }),

  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must be less than 100 characters',
      'any.required': 'Title is required',
    }),

  comment: Joi.string()
    .trim()
    .min(5)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment is required',
      'string.min': 'Comment must be at least 5 characters long',
      'string.max': 'Comment must be less than 1000 characters',
      'any.required': 'Comment is required',
    }),

  isRecommending: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'isRecommending must be true or false',
      'any.required': 'isRecommending is required',
    }),
});

export const updateReviewDto = Joi.object({
  rating: ratingSchema.optional(),
  title: Joi.string().trim().min(3).max(100).optional(),
  comment: Joi.string().trim().min(5).max(1000).optional(),
  isRecommending: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update',
});
