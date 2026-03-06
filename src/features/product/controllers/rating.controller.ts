import { Request, Response } from 'express';
import * as ratingService from '../services/rating.service';
import Joi from 'joi';

const rateProductSchema = Joi.object({
  value: Joi.number().integer().min(1).max(5).required(),
  userId: Joi.string().uuid().required(),
});

export const rateProduct = async (req: Request, res: Response) => {
  try {
    const { id: productId } = req.params;
    const { error, value } = rateProductSchema.validate(req.body);

    
    if (error) {
       res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
      return;
    }

    const product = await ratingService.rateProduct({
      productId,
      userId: value.userId,
      value: value.value,
    });

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Something went wrong',
    });
  }
};
