import { ContactMessage } from "../../../interfaces/subscribe.interface";
import { sendEmail } from "../../../utils/email";

export class EmailService {

  async sendContactMessage(contactMessage: ContactMessage): Promise<void> {
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

    await sendEmail(mailOptions);
  }
}
