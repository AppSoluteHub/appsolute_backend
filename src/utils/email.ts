import nodemailer from 'nodemailer';
import env from '../config/env';

export const sendEmail = async (data :any) => {
  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.node_mailer_user,
        pass: env.node_mailer_pass,
      },
    });

    const mailOptions = {
      from: `AppSolute <${env.node_mailer_user}>`,
      to: data.email,
      subject: data.subject,
      html: data.html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};


