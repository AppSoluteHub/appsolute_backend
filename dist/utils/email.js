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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const sendEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
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
            from: `ApSolute <${env_1.default.node_mailer_user}>`,
            to: data.email,
            subject: data.subject,
            html: data.html,
        };
        const info = yield transport.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
});
exports.sendEmail = sendEmail;
