import { PrismaClient } from '@prisma/client';
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
  return await prisma.category.delete({ where: { id } });
};
