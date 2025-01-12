"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ContentService {
    createContent(body, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!body || !description) {
                    throw { statusCode: 400, message: "Body and description are required" };
                }
                const content = yield prisma.content.create({
                    data: { body, description },
                });
                return content;
            }
            catch (error) {
                throw ContentService.formatError(error);
            }
        });
    }
    getAllContent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contents = yield prisma.content.findMany();
                return contents;
            }
            catch (error) {
                throw ContentService.formatError(error);
            }
        });
    }
    getContentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield prisma.content.findUnique({
                    where: { id },
                });
                if (!content) {
                    throw { statusCode: 404, message: "Content not found" };
                }
                return content;
            }
            catch (error) {
                throw ContentService.formatError(error);
            }
        });
    }
    updateContent(id, body, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!body || !description) {
                    throw { statusCode: 400, message: "Body and description are required" };
                }
                const updatedContent = yield prisma.content.update({
                    where: { id },
                    data: { body, description },
                });
                return updatedContent;
            }
            catch (error) {
                throw ContentService.formatError(error);
            }
        });
    }
    deleteContent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedContent = yield prisma.content.delete({
                    where: { id },
                });
                return deletedContent;
            }
            catch (error) {
                throw ContentService.formatError(error);
            }
        });
    }
    static formatError(error) {
        if (error.statusCode && error.message) {
            return error;
        }
        console.error("Unexpected error:", error);
        return { statusCode: 500, message: "An unexpected error occurred" };
    }
}
exports.default = new ContentService();
