import { Request, Response } from "express";
import { EmailService } from "../services/subscriber.service";
import { ContactMessage } from "../../../interfaces/subscribe.interface";
export class ContactController {
  private emailService = new EmailService();

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, writeMessage } = req.body;

      if (!fullName || !email || !writeMessage) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const contactMessage: ContactMessage = { fullName, email, writeMessage };

      await this.emailService.sendContactMessage(contactMessage);

      res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("Error sending contact message:", error);
      res
        .status(500)
        .json({ error: "Failed to send message. Please try again later." });
    }
  }
}
