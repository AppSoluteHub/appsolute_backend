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
exports.deleteSoftware = exports.updateSoftware = exports.getSoftwareById = exports.getAllSoftware = exports.createSoftware = void 0;
const softwareService = __importStar(require("../services/software.service"));
const appResponse_1 = __importDefault(require("../../../lib/appResponse"));
const createSoftware = async (req, res) => {
    try {
        const software = await softwareService.createSoftware(req.body);
        res.status(201).json((0, appResponse_1.default)('Software created successfully', software));
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};
exports.createSoftware = createSoftware;
const getAllSoftware = async (req, res) => {
    try {
        const { page, limit, category, search } = req.query;
        const options = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            category: category,
            search: search,
        };
        const software = await softwareService.getAllSoftware(options);
        res.status(200).json((0, appResponse_1.default)('Software retrieved successfully', software));
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};
exports.getAllSoftware = getAllSoftware;
const getSoftwareById = async (req, res) => {
    try {
        const software = await softwareService.getSoftwareById(req.params.id);
        res.status(200).json((0, appResponse_1.default)('Software retrieved successfully', software));
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};
exports.getSoftwareById = getSoftwareById;
const updateSoftware = async (req, res) => {
    try {
        const software = await softwareService.updateSoftware(req.params.id, req.body);
        res.status(200).json((0, appResponse_1.default)('Software updated successfully', software));
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};
exports.updateSoftware = updateSoftware;
const deleteSoftware = async (req, res) => {
    try {
        await softwareService.deleteSoftware(req.params.id);
        res.status(200).json((0, appResponse_1.default)('Software deleted successfully', null));
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};
exports.deleteSoftware = deleteSoftware;
