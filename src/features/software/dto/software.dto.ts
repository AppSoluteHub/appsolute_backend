
import Joi from 'joi';

export const createSoftwareDto = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string(),
  downloadUrl: Joi.string().uri(),
  category: Joi.string(),
  bgColor: Joi.string(),
  image: Joi.string(),
});

export const updateSoftwareDto = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string(),
  downloadUrl: Joi.string().uri(),
  category: Joi.string(),
  bgColor: Joi.string(),
  image: Joi.string(),
});

