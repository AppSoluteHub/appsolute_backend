"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriber_controller_1 = __importDefault(require("../controllers/subscriber.controller"));
const router = express_1.default.Router();
router.post("/", subscriber_controller_1.default.subscribe);
exports.default = router;
