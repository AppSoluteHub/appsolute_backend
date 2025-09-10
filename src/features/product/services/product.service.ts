import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../lib/appError';

const prisma = new PrismaClient();

export const createProduct = async (data: any) => {
  return await prisma.product.create({ data });
};

export const getAllProducts = async (options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) => {
  const { page = 1, limit = 10, category, search } = options;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (category) {
    where.category = category;
  }
  if (search) {
    where.title = {
      contains: search,
      mode: 'insensitive',
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
  };
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

export const updateProduct = async (id: number, data: any) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: number) => {
  return await prisma.product.delete({
    where: { id },
  });
};