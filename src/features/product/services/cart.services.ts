import { PrismaClient, Cart, CartItem, Product } from "@prisma/client";
import { BadRequestError } from "../../../lib/appError";

const prisma = new PrismaClient();

type CartWithExtras = Cart & {
  items: (CartItem & { product: Product })[];
  relatedProducts: Product[];
  vat: number;
  discount: number;
};

export const getCart = async (userId: string): Promise<CartWithExtras | null> => {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    return null;
  }

  // Calculate and update subtotal and total
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discount = cart.items.reduce(
    (acc, item) => acc + (item.product.price * (item.product.discount || 0) / 100 * item.quantity),
    0
  );

  const totalBeforeVat = subtotal - discount;
  const vat = totalBeforeVat * 0.075;
  const total = totalBeforeVat + vat;

  // Update cart totals in database
  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      subtotal,
      total,
      vat,
      discount,
    },
  });

  // Related products based on categories of items in cart
  const categories = cart.items.map(item => item.product.category);
  const uniqueCategories = [...new Set(categories)];
  const productIds = cart.items.map((item) => item.productId);

  let relatedProducts: Product[] = [];
  if (uniqueCategories.length > 0) {
    relatedProducts = await prisma.product.findMany({
      where: {
        category: { in: uniqueCategories },
        id: { notIn: productIds },
      },
      take: 4,
    });
  }

  return {
    ...cart,
    subtotal,
    total,
    vat,
    discount,
    relatedProducts,
  };
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  let cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { 
        userId,
        subtotal: 0,
        total: 0,
        vat: 0,
        discount: 0,
      },
    });
  }

  // Ensure product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new BadRequestError('Product not found', 404);

  // Check if product already in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > 5) {
      throw new BadRequestError('You can only add up to 5 items of the same product to your cart.', 400);
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    if (quantity > 5) {
      throw new BadRequestError('You can only add up to 5 items of the same product to your cart.', 400);
    }
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getCart(userId);
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) throw new BadRequestError('Cart not found', 404);

  const item = await prisma.cartItem.findFirst({ 
    where: { 
      id: cartItemId,
      cartId: cart.id, 
    } 
  });
  if (!item) throw new BadRequestError('Item not found in cart', 404);

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return getCart(userId);
};

export const updateCartItemQuantity = async (
  userId: string, 
cartItemId: string, 
  quantity: number
) => {
  if (quantity <= 0) {
    return removeFromCart(userId, cartItemId);
  }

  if (quantity > 5) {
    throw new BadRequestError('You can only have up to 5 items of the same product in your cart.', 400);
  }

  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) throw new BadRequestError('Cart not found', 404);

  const item = await prisma.cartItem.findFirst({
    where: { 
      id: cartItemId,
      cartId: cart.id,
    },
  });
  if (!item) throw new BadRequestError('Item not found in cart', 404);

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) throw new BadRequestError('Cart not found', 404);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      subtotal: 0,
      total: 0,
      vat: 0,
      discount: 0,
    },
  });

  return getCart(userId);
};

export const getCartItemCount = async (userId: string): Promise<number> => {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true },
  });

  if (!cart) return 0;

  return cart.items.reduce((acc, item) => acc + item.quantity, 0);
};