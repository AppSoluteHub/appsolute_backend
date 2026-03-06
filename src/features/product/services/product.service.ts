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

export const getPopularProducts = async (limit: number = 10) => {
  try {
    // Get products with their rating and sales data
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        reviews: true,
        ratings: true,
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    // Calculate popularity score for each product
    const productsWithPopularity = products.map((product) => {
      const reviewCount = product.reviews.length;
      const ratingCount = product.ratings.length;
      const averageRating = product.averageRating || 0;

      // Calculate total sales (sum of quantities from completed orders)
      const totalSales = product.orderItems
        .filter((item) => item.order.status === 'COMPLETED')
        .reduce((sum, item) => sum + item.quantity, 0);

      // Popularity score formula:
      // - Rating weight: 40%
      // - Review count weight: 30%
      // - Sales weight: 30%
      const popularityScore =
        (averageRating * 0.4) +
        (Math.min(reviewCount / 10, 5) * 0.3) + // Cap review influence at 5
        (Math.min(totalSales / 5, 5) * 0.3); // Cap sales influence at 5

      return {
        ...product,
        popularityScore,
        reviewCount,
        ratingCount,
        totalSales,
      };
    });

    // Sort by popularity score (descending) and return top products
    const popularProducts = productsWithPopularity
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit)
      .map(({ popularityScore, reviewCount, ratingCount, totalSales, ...product }) => ({
        ...product,
        stats: {
          reviewCount,
          ratingCount,
          totalSales,
          averageRating: product.averageRating,
        },
      }));

    return popularProducts;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw new AppError('Failed to fetch popular products', 500);
  }
};