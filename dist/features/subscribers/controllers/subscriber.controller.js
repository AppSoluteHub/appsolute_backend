"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const subscriber_service_1 = require("../services/subscriber.service");
class ContactController {
    constructor() {
        this.emailService = new subscriber_service_1.EmailService();
    }
    async sendMessage(req, res) {
        try {
            const { fullName, email, writeMessage } = req.body;
            if (!fullName || !email || !writeMessage) {
                res.status(400).json({ error: "All fields are required" });
                return;
            }
            const contactMessage = { fullName, email, writeMessage };
            await this.emailService.sendContactMessage(contactMessage);
            res.status(200).json({ message: "Message sent successfully!" });
        }
        catch (error) {
            console.error("Error sending contact message:", error);
            res
                .status(500)
                .json({ error: "Failed to send message. Please try again later." });
        }
    }
}
exports.ContactController = ContactController;
