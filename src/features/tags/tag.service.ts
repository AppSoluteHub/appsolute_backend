import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../lib/appError';
const prisma = new PrismaClient();

export const createTag = async (data: { name: string }) => {
  const { name } = data;

  try {
    const tag = await prisma.tag.create({
      data: { name }
    });
    return { success: true, tag };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' // Unique constraint failed
    ) {
      // Return a handled error response instead of throwing
      return { success: false, message: `Tag with name '${name}' already exists.` };
    }
    // For any other errors, you can log and return a general error object
    console.error('Error creating tag:', error);
    return { success: false, message: 'An unexpected error occurred while creating the tag.' };
  }
}

export const getAllTags = async () => {
  return await prisma.tag.findMany({
    orderBy:{
      createdAt: 'desc'
    }
  });
};

export const getTagById = async (id: string) => {
  return await prisma.tag.findUnique({ where: { id } });
};



export const updateTag = async (id: string, data: { name?: string }) => {
  try {
    return await prisma.tag.update({
      where: { id },
      data,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002' &&
      Array.isArray((err.meta as { target?: string[] }).target) &&
      (err.meta as { target: string[] }).target.includes('name')
    ) {
      const uniqueError = new Error('A tag with that name already exists.');
      (uniqueError as any).statusCode = 409;
      throw uniqueError;
    }
    throw err;
  }
};


export const deleteTag = async (id: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } })
  if (!tag) {
    throw new NotFoundError(`Tag with id ${id} not found`)
  }

  try {
    await prisma.taskTag.deleteMany({ where: { tagId: id } })
    return await prisma.tag.delete({ where: { id } })
  } catch (err) {
    throw err
  }
}
