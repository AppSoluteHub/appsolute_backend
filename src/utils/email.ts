import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (data :any) => {
  try {
const transport = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,                     
  secure: true,                 
  auth: {
    user: process.env.MYEMAIL_USER,
    pass: process.env.EMAIL_PASS,
    
  },
});

    const mailOptions = {
      from: `AppSolute <${process.env.MYEMAIL_USER}>`,
      to: data.email,
      subject: data.subject,
      html: data.html,
    };

    const info = await transport.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};


