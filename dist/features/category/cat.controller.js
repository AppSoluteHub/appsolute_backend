"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const categoryService = __importStar(require("../category/cat.service"));
const createCategory = async (req, res) => {
    const { name } = req.body;
    const category = await categoryService.createCategory({ name });
    res.status(201).json(category);
};
exports.createCategory = createCategory;
const getAllCategories = async (_req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
    }
    res.json(category);
};
exports.getCategoryById = getCategoryById;
// export const updateCategory = async (req: Request, res: Response) => {
//   const category = await categoryService.updateCategory(req.params.id, req.body);
//   res.json(category);
// };
const updateCategory = async (req, res, next) => {
    const { id } = req.params;
    const data = { name: req.body.name };
    try {
        const cat = await categoryService.updateCategory(id, data);
        res.status(200).json(cat);
        return;
    }
    catch (err) {
        if (err.statusCode === 409) {
            res.status(409).json({ error: err.message });
            return;
        }
        next(err);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedCat = await categoryService.deleteCategory(id);
        res.status(200).json({
            message: 'Tag deleted successfully'
        });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
