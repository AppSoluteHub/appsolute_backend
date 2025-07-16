"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.getTagById = exports.getAllTags = exports.createTag = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const prisma = new client_1.PrismaClient();
const createTag = async (data) => {
    const { name } = data;
    try {
        const tag = await prisma.tag.create({
            data: { name }
        });
        return { success: true, tag };
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002' // Unique constraint failed
        ) {
            // Return a handled error response instead of throwing
            return { success: false, message: `Tag with name '${name}' already exists.` };
        }
        // For any other errors, you can log and return a general error object
        console.error('Error creating tag:', error);
        return { success: false, message: 'An unexpected error occurred while creating the tag.' };
    }
};
exports.createTag = createTag;
const getAllTags = async () => {
    return await prisma.tag.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};
exports.getAllTags = getAllTags;
const getTagById = async (id) => {
    return await prisma.tag.findUnique({ where: { id } });
};
exports.getTagById = getTagById;
const updateTag = async (id, data) => {
    try {
        return await prisma.tag.update({
            where: { id },
            data,
        });
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002' &&
            Array.isArray(err.meta.target) &&
            err.meta.target.includes('name')) {
            const uniqueError = new Error('A tag with that name already exists.');
            uniqueError.statusCode = 409;
            throw uniqueError;
        }
        throw err;
    }
};
exports.updateTag = updateTag;
const deleteTag = async (id) => {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
        throw new appError_1.NotFoundError(`Tag with id ${id} not found`);
    }
    try {
        await prisma.taskTag.deleteMany({ where: { tagId: id } });
        return await prisma.tag.delete({ where: { id } });
    }
    catch (err) {
        throw err;
    }
};
exports.deleteTag = deleteTag;
