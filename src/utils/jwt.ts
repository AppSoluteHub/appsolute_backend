import jwt from "jsonwebtoken";
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET as string;
// const jwtSecret = require("./config/index").jwtSecret;

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "1d" }); 
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" }); // 7 days expiration
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, jwtSecret);
};
