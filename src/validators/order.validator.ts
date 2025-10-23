import Joi from 'joi';

export const createOrderSchema = Joi.object({
  billingAddress: Joi.object({
    fullName: Joi.string().required(),
    lastName: Joi.string().required(),
    company: Joi.string().optional(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.string().required(),
    note: Joi.string().optional(),
  }).required(),
});
