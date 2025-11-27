"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSoftware = exports.updateSoftware = exports.getSoftwareById = exports.getAllSoftware = exports.createSoftware = void 0;
const appError_1 = require("../../../lib/appError");
const prisma_1 = require("../../../utils/prisma");
const createSoftware = async (data) => {
    return await prisma_1.prisma.software.create({ data });
};
exports.createSoftware = createSoftware;
const getAllSoftware = async (options) => {
    const { page = 1, limit = 10, category, search } = options;
    const skip = (page - 1) * limit;
    const where = {};
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
        prisma_1.prisma.software.findMany({
            where,
            skip,
            take: limit,
        }),
        prisma_1.prisma.software.count({ where }),
    ]);
    return {
        software,
        total,
        page,
        limit,
    };
};
exports.getAllSoftware = getAllSoftware;
const getSoftwareById = async (id) => {
    const software = await prisma_1.prisma.software.findUnique({
        where: { id },
    });
    if (!software) {
        throw new appError_1.AppError('Software not found', 404);
    }
    return software;
};
exports.getSoftwareById = getSoftwareById;
const updateSoftware = async (id, data) => {
    return await prisma_1.prisma.software.update({
        where: { id },
        data,
    });
};
exports.updateSoftware = updateSoftware;
const deleteSoftware = async (id) => {
    return await prisma_1.prisma.software.delete({
        where: { id },
    });
};
exports.deleteSoftware = deleteSoftware;
