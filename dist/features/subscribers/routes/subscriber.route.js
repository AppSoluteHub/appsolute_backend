"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriber_controller_1 = require("../controllers/subscriber.controller");
const router = express_1.default.Router();
const contactController = new subscriber_controller_1.ContactController();
router.post("/contact", (req, res) => contactController.sendMessage(req, res));
exports.default = router;
