"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const email_1 = require("../../../utils/email");
class EmailService {
    async sendContactMessage(contactMessage) {
        const { fullName, email, writeMessage } = contactMessage;
        const mailOptions = {
            from: `"${fullName}" <${email}>`,
            to: "app.solution.wonder@gmail.com",
            subject: "New Contact Us Message",
            text: writeMessage,
            html: `
        <p><strong>From:</strong> ${fullName} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${writeMessage}</p>
      `,
        };
        await (0, email_1.sendEmail)(mailOptions);
    }
}
exports.EmailService = EmailService;
