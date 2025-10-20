
import Joi from 'joi';

export const initiatePaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().required(),
  email: Joi.string().email().required(),
});
