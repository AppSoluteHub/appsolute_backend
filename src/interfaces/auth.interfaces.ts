import { Role } from "@prisma/client";

export interface RegisterInput {
    fullName: string;
    profileImage: string;
    email: string;
    password: string;
    role?: Role
   
  }
  
  export interface EmailData {
    email: string;
    subject: string;
    html: string;
  }
  