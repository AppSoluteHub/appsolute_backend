"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const email_1 = require("../../../utils/email");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class SubscriberService {
    static async subscribe(email) {
        if (!email)
            throw new appError_1.BadRequestError("Email is required");
        const existingSubscriber = await prisma.subscriber.findUnique({ where: { email } });
        if (existingSubscriber)
            throw new appError_1.BadRequestError("Email is already subscribed");
        const newSubscriber = await prisma.subscriber.create({
            data: { email },
        });
        const emailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="background: #37459C; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">Welcome to Our Community! 🎉</h1>
              <p style="margin: 5px 0; font-size: 16px;">Subscription Confirmed</p>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px; color: #333;">Hello <strong style="color: #37459C;">${email}</strong>,</p>
              <p style="font-size: 14px; color: #555;">Thank you for subscribing! We are excited to have you with us. Stay tuned for exciting updates and content.</p>
              
              <h3 style="color: #444;">📺 Subscribe to Our YouTube Channel</h3>
              <p style="font-size: 14px;">To get the best content, subscribe to our YouTube channel:</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="https://www.youtube.com/@appsolutehub" 
                   style="text-decoration: none; background: red; color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px;">
                  Subscribe Now 🔥
                </a>
              </div>

              <p style="font-size: 14px; color: #555;">If you did not subscribe, you can ignore this email.</p>
            </div>
            <div style="background: #f9f9f9; padding: 10px 20px; text-align: center; font-size: 12px; color: #888;">
              <p style="margin: 0;">For any inquiries, contact us at <a href="mailto:support@appsolutehub.com" style="color: #37459C;">support@appsolutehub.com</a>.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Appsolutehub.com. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        const emailData = {
            email,
            subject: "🎉 Subscription Confirmed – Welcome!",
            html: emailTemplate,
        };
        await (0, email_1.sendEmail)(emailData);
        return "Subscription successful. A confirmation email has been sent.";
    }
}
exports.default = SubscriberService;
