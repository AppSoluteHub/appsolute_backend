import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../lib/appError';
const prisma = new PrismaClient();

export const createCategory = async (data: { name: string }) => {
  return await prisma.category.create({ data });
};

export const getAllCategories = async () => {
  return await prisma.category.findMany();
};

export const getCategoryById = async (id: string) => {
  return await prisma.category.findUnique({ where: { id } });
};

export const updateCategory = async (id: string, data: { name?: string }) => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};



export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new NotFoundError(`Category with id ${id} not found`);
  }

  try {
    // Delete associated PostCategoryLink records first
    await prisma.postCategoryLink.deleteMany({ where: { categoryId: id } });

    // Now delete the category
    return await prisma.category.delete({ where: { id } });
  } catch (err) {
    throw new Error('Cannot delete category. Please try again later.');
  }
};
