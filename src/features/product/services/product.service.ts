import { AppError } from '../../../lib/appError';
import { prisma } from '../../../utils/prisma';

export const createProduct = async (data: any) => {
  return await prisma.product.create({ data });
};

export const getAllProducts = async (options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  brand?: string;
  tags?: string[]; 
}) => {
  const { page = 1, limit = 10, category, search, brand, tags } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (brand) {
    where.brand = brand;
  }

  if (tags && tags.length > 0) {
   
    where.tags = {
      hasSome: tags, 
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


export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    take: 4,
  });

  return {
    product,
    relatedProducts,
  };
};


export const updateProduct = async (id: string, data: any) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  return await prisma.product.delete({
    where: { id },
  });
};