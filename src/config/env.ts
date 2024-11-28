import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT,
  mongo_uri: process.env.MONGO_URI,
  jwt_key: process.env.JWT_SECRET,
  otp_key: process.env.OTP_KEY,
    elastiemail_api_key: process.env.ELASTICEMAIL_API_KEY,
    email_user : process.env.MYEMAIL_USER,
    node_mailer_user :process.env.EMAIL_USER,
    node_mailer_pass : process.env.EMAIL_PASS,
    otpKey: process.env.OTP_KEY,
};