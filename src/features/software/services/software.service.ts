import { AppError } from '../../../lib/appError';
import { prisma } from '../../../utils/prisma';

export const createSoftware = async (data: {
  title: string;
  description?: string;
  downloadUrl?: string;
  category?: string;
  bgColor?: string;
  image?: string;
}) => {
  return await prisma.software.create({ data });
};

export const getAllSoftware = async (options: {
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

  const [software, total] = await Promise.all([
    prisma.software.findMany({
      where,
      skip,
      take: limit,
    }),
    prisma.software.count({ where }),
  ]);

  return {
    software,
    total,
    page,
    limit,
  };
};

export const getSoftwareById = async (id: string) => {
  const software = await prisma.software.findUnique({
    where: { id },
  });
  if (!software) {
    throw new AppError('Software not found', 404);
  }
  return software;
};

export const updateSoftware = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    downloadUrl?: string;
    category?: string;
    bgColor?: string;
    image?: string;
  }
) => {
  return await prisma.software.update({
    where: { id },
    data,
  });
};

export const deleteSoftware = async (id: string) => {
  return await prisma.software.delete({
    where: { id },
  });
};