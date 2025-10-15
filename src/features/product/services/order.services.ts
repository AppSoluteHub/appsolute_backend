
import { PrismaClient } from '@prisma/client';
import {  BadRequestError } from '../../../lib/appError';
import crypto from "crypto";

const prisma = new PrismaClient();

type BillingAddressInput = {
  fullName: string;
  lastName: string;
  company?: string;
  country: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  address: string;
  userId: string;
};

export const getUsersOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { not: 'PENDING' },
    },
      include: {
      items: {
        include: {
          product: true,
        },
      },
      billingAddress: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      billingAddress: true,
    },
  });

  if (!order) {
    throw new BadRequestError('Order not found', 404);
  }

  return order;
};


export const createOrder = async (userId: string, billingAddress: BillingAddressInput) => {
  return await prisma.$transaction(async (tx) => {
  const cart = await tx.cart.findFirst({
    where: { userId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Cart is empty", 400);
  }

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

  const { userId: _ignore, ...billingData } = billingAddress; 

  const order = await tx.order.create({
    data: {
      userId,
      total,
      vat,
      discount,
      status: "PROCESSING",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
      billingAddress: {
        create: {
          ...billingData,
          user: {
            connect: { id: userId },
          },
        },
      },
    },
    include: {
      items: { include: { product: true } },
      billingAddress: true,
    },
  });

  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

  return order;
}, {
  timeout: 10000,
});
}


export const generateShareableOrderLink = async (userId: string, orderId: string) => {
  // Find the order
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new BadRequestError("Order not found or you do not have access", 404);
  }

  // Generate a unique token
  const token = crypto.randomBytes(16).toString("hex");

  // Save token in the order
  await prisma.order.update({
    where: { id: orderId },
    data: { shareToken: token },
  });

  // Return shareable URL
  const url = `${process.env.FRONTEND_URL}/shared-order/${token}`;
  return { success: true, url };
};

// Fetch order by share token
export const getOrderByShareToken = async (token: string) => {
  const order = await prisma.order.findFirst({
    where: { shareToken: token },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    throw new BadRequestError("Invalid or expired share link", 404);
  }

  return order;
};