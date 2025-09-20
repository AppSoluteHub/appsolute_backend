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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController = __importStar(require("../controllers/product.controller"));
const validateRequest_1 = require("../../../middlewares/validateRequest");
const product_dto_1 = require("../dto/product.dto");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const multer_1 = __importDefault(require("../../../config/multer"));
const validateFile_1 = require("../../../middlewares/validateFile");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.default, 
// isAdmin,
multer_1.default.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), validateFile_1.validateFile, (0, validateRequest_1.validateRequest)(product_dto_1.createProductDto), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id', auth_middleware_1.default, 
// isAdmin,
multer_1.default.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), validateFile_1.validateFile, (0, validateRequest_1.validateRequest)(product_dto_1.updateProductDto), productController.updateProduct);
router.delete('/:id', auth_middleware_1.default, productController.deleteProduct);
exports.default = router;
