import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.services';
import { AppError, BadRequestError, UnAuthorizedError } from '../../../lib/appError';
import { catchAsync } from '../../../utils/catchAsync';

export const getCartController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const cart = await cartService.getCart(userId);
    
    res.status(200).json({
      success: true,
      data: cart,
      message: cart ? 'Cart retrieved successfully' : 'Cart is empty'
    });
  } catch (error) {
    next(error);
  }
};

export const addToCartController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    if (!userId) {
      throw new UnAuthorizedError('User not authenticated', 401);
    }
   
    const { quantity = 1 , productId} = req.body;

    if (!userId) {
      throw new BadRequestError('User not authenticated', 401);
    }

    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    if (quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    
    const cart = await cartService.addToCart(userId, productId, Number(quantity));

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCartController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { cartItemId } = req.params;

    if (!userId) {
      throw new UnAuthorizedError('User not authenticated', 401);
    }

    if (!cartItemId) {
      throw new BadRequestError('Cart item ID is required');
    }

    const cart = await cartService.removeFromCart(userId, cartItemId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    // const { cartItemId } = req.params;
    const { quantity , cartItemId} = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!cartItemId) {
      throw new BadRequestError('Cart item ID is required');
    }

    if (!quantity || quantity < 1) {
      throw new BadRequestError('Valid quantity is required');
    }

    const cart = await cartService.updateCartItemQuantity(userId, cartItemId, Number(quantity));

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const clearCartController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const cart = await cartService.clearCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCartItemCountController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const count = await cartService.getCartItemCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
      message: 'Cart item count retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const bulkAddToCartController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { items } = req.body; // Array of { productId, quantity }

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Items array is required');
  }

  // Validate each item
  for (const item of items) {
    if (!item.productId) {
      throw new BadRequestError('Product ID is required for all items');
    }
    if (!item.quantity || item.quantity < 1) {
      throw new BadRequestError('Valid quantity is required for all items');
    }
  }

  let cart = null;
  for (const item of items) {
    cart = await cartService.addToCart(userId, item.productId, item.quantity);
  }

  res.status(200).json({
    success: true,
    data: cart,
    message: `${items.length} items added to cart successfully`
  });
});

export const getCartSummaryController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const cart = await cartService.getCart(userId);
  
  const summary = cart ? {
    itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: cart.subtotal,
    total: cart.total,
    isEmpty: cart.items.length === 0
  } : {
    itemCount: 0,
    subtotal: 0,
    total: 0,
    isEmpty: true
  };

  res.status(200).json({
    success: true,
    data: summary,
    message: 'Cart summary retrieved successfully'
  });
});