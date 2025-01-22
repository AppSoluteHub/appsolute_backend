"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const sendEmail = async (data) => {
    try {
        const transport = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: env_1.default.node_mailer_user,
                pass: env_1.default.node_mailer_pass,
            },
        });
        const mailOptions = {
            from: `AppSolute <${env_1.default.node_mailer_user}>`,
            to: data.email,
            subject: data.subject,
            html: data.html,
        };
        const info = await transport.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};
exports.sendEmail = sendEmail;
