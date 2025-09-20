"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleImagesToCloudinary = exports.uploadImageToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const appError_1 = require("../lib/appError");
const uploadImageToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.default.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                return reject(new appError_1.AppError('Failed to upload image to Cloudinary', 500));
            }
            if (!result || !result.secure_url) {
                return reject(new appError_1.AppError('Cloudinary upload did not return a secure URL', 500));
            }
            resolve(result.secure_url);
        }).end(file.buffer);
    });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const uploadMultipleImagesToCloudinary = async (files) => {
    const uploadPromises = files.map(file => (0, exports.uploadImageToCloudinary)(file));
    return Promise.all(uploadPromises);
};
exports.uploadMultipleImagesToCloudinary = uploadMultipleImagesToCloudinary;
