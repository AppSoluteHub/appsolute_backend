"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma = new client_1.PrismaClient();
const createCategory = async (data) => {
    return await prisma.category.create({ data });
};
exports.createCategory = createCategory;
const getAllCategories = async () => {
    return await prisma.category.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (id) => {
    return await prisma.category.findUnique({ where: { id } });
};
exports.getCategoryById = getCategoryById;
// export const updateCategory = async (id: string, data: { name?: string }) => {
//   return await prisma.category.update({
//     where: { id },
//     data,
//   });
// };
const updateCategory = async (id, data) => {
    try {
        return await prisma.category.update({
            where: { id },
            data,
        });
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002' &&
            Array.isArray(err.meta.target) &&
            err.meta.target.includes('name')) {
            const uniqueError = new Error('A Category with that name already exists.');
            uniqueError.statusCode = 409;
            throw uniqueError;
        }
        throw err;
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new appError_1.NotFoundError(`Category with id ${id} not found`);
    }
    try {
        // Delete associated PostCategoryLink records first
        await prisma.postCategoryLink.deleteMany({ where: { categoryId: id } });
        // Now delete the category
        return await prisma.category.delete({ where: { id } });
    }
    catch (err) {
        throw new Error('Cannot delete category. Please try again later.');
    }
};
exports.deleteCategory = deleteCategory;
