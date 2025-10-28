"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartSummaryController = exports.bulkAddToCartController = exports.getCartItemCountController = exports.clearCartController = exports.updateCartItemController = exports.removeFromCartController = exports.addToCartController = exports.getCartController = void 0;
const cartService = __importStar(require("../services/cart.services"));
const appError_1 = require("../../../lib/appError");
const catchAsync_1 = require("../../../utils/catchAsync");
const getCartController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const cart = await cartService.getCart(userId);
        res.status(200).json({
            success: true,
            data: cart,
            message: cart ? 'Cart retrieved successfully' : 'Cart is empty'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCartController = getCartController;
const addToCartController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.UnAuthorizedError('User not authenticated', 401);
        }
        const { quantity = 1, productId } = req.body;
        if (!userId) {
            throw new appError_1.BadRequestError('User not authenticated', 401);
        }
        if (!productId) {
            throw new appError_1.BadRequestError('Product ID is required');
        }
        if (quantity < 1) {
            throw new appError_1.BadRequestError('Quantity must be at least 1');
        }
        const cart = await cartService.addToCart(userId, productId, Number(quantity));
        res.status(200).json({
            success: true,
            data: cart,
            message: 'Item added to cart successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCartController = addToCartController;
const removeFromCartController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { cartItemId } = req.params;
        if (!userId) {
            throw new appError_1.UnAuthorizedError('User not authenticated', 401);
        }
        if (!cartItemId) {
            throw new appError_1.BadRequestError('Cart item ID is required');
        }
        const cart = await cartService.removeFromCart(userId, cartItemId);
        res.status(200).json({
            success: true,
            data: cart,
            message: 'Item removed from cart successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCartController = removeFromCartController;
const updateCartItemController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        // const { cartItemId } = req.params;
        const { quantity, cartItemId } = req.body;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        if (!cartItemId) {
            throw new appError_1.BadRequestError('Cart item ID is required');
        }
        if (!quantity || quantity < 1) {
            throw new appError_1.BadRequestError('Valid quantity is required');
        }
        const cart = await cartService.updateCartItemQuantity(userId, cartItemId, Number(quantity));
        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart item updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItemController = updateCartItemController;
const clearCartController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const cart = await cartService.clearCart(userId);
        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart cleared successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCartController = clearCartController;
const getCartItemCountController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new appError_1.AppError('User not authenticated', 401);
        }
        const count = await cartService.getCartItemCount(userId);
        res.status(200).json({
            success: true,
            data: { count },
            message: 'Cart item count retrieved successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCartItemCountController = getCartItemCountController;
exports.bulkAddToCartController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    const { items } = req.body; // Array of { productId, quantity }
    if (!userId) {
        throw new appError_1.AppError('User not authenticated', 401);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new appError_1.BadRequestError('Items array is required');
    }
    // Validate each item
    for (const item of items) {
        if (!item.productId) {
            throw new appError_1.BadRequestError('Product ID is required for all items');
        }
        if (!item.quantity || item.quantity < 1) {
            throw new appError_1.BadRequestError('Valid quantity is required for all items');
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
exports.getCartSummaryController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new appError_1.AppError('User not authenticated', 401);
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
