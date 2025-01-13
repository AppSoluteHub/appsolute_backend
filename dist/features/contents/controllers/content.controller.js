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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const content_service_1 = __importDefault(require("../services/content.service"));
class ContentController {
    createContent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { body, description } = req.body;
                if (!body || !description) {
                    return res.status(400).json({ success: false, message: "Body and description are required" });
                }
                const content = yield content_service_1.default.createContent(body, description);
                return res.status(201).json({ success: true, data: content });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({ success: false, message: error.message });
            }
        });
    }
    getAllContent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contents = yield content_service_1.default.getAllContent();
                return res.status(200).json({ success: true, data: contents });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({ success: false, message: error.message });
            }
        });
    }
    getContentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(400).json({ success: false, message: "ID is required" });
                }
                const content = yield content_service_1.default.getContentById(id);
                return res.status(200).json({ success: true, data: content });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({ success: false, message: error.message });
            }
        });
    }
    updateContent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { body, description } = req.body;
                if (!id || !body || !description) {
                    return res.status(400).json({ success: false, message: "ID, body, and description are required" });
                }
                const updatedContent = yield content_service_1.default.updateContent(id, body, description);
                return res.status(200).json({ success: true, data: updatedContent });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({ success: false, message: error.message });
            }
        });
    }
    deleteContent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(400).json({ success: false, message: "ID is required" });
                }
                const deletedContent = yield content_service_1.default.deleteContent(id);
                return res.status(200).json({ success: true, data: deletedContent });
            }
            catch (error) {
                return res.status(error.statusCode || 500).json({ success: false, message: error.message });
            }
        });
    }
}
exports.default = new ContentController();
