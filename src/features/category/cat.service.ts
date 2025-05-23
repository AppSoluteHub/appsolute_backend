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

// export const deleteCategory = async (id: string) => {
//   return await prisma.category.delete({ where: { id } });
// };

export const deleteCategory = async (id: string) => {
  const cat = await prisma.category.findUnique({ where: { id } });

  if (!cat) {
    throw new NotFoundError(`Tag with id ${id} not found`);
  }

  const deletedCat = await prisma.category.delete({
    where: { id },
  });

  return deletedCat;
};
