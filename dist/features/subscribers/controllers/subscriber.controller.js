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
exports.ContactController = void 0;
const subscriber_service_1 = require("../services/subscriber.service");
class ContactController {
    constructor() {
        this.emailService = new subscriber_service_1.EmailService();
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fullName, email, writeMessage } = req.body;
                if (!fullName || !email || !writeMessage) {
                    res.status(400).json({ error: "All fields are required" });
                    return;
                }
                const contactMessage = { fullName, email, writeMessage };
                yield this.emailService.sendContactMessage(contactMessage);
                res.status(200).json({ message: "Message sent successfully!" });
            }
            catch (error) {
                console.error("Error sending contact message:", error);
                res
                    .status(500)
                    .json({ error: "Failed to send message. Please try again later." });
            }
        });
    }
}
exports.ContactController = ContactController;
