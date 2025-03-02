"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscriber_service_1 = __importDefault(require("../services/subscriber.service"));
class SubscriberController {
    static async subscribe(req, res) {
        try {
            const { email } = req.body;
            const message = await subscriber_service_1.default.subscribe(email);
            res.status(201).json({ message });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.default = SubscriberController;
