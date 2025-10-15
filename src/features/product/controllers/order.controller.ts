
import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.services';
import { createOrderSchema } from '../../../validators/order.validator';
import { AppError, BadRequestError, UnAuthorizedError } from '../../../lib/appError';

export const getOrdersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    const orders = await orderService.getUsersOrders(userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    if (!userId) {
      throw new UnAuthorizedError('User not authenticated', 401);
    }
    const { orderId } = req.params;
    const order = await orderService.getOrderById(userId, orderId);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const createOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    if (!userId) {
      throw new UnAuthorizedError('User not authenticated', 401);
    }

    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message, 400);
    }

    const order = await orderService.createOrder(userId, value.billingAddress);
    res.json(order);
  } catch (error) {
    next(error);
  }
};



export const shareOrderLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;

    const result = await orderService.generateShareableOrderLink(userId!, orderId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const viewSharedOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const order = await orderService.getOrderByShareToken(token);
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

