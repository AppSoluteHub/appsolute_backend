import { PrismaClient, User } from "@prisma/client";
import { BadRequestError, DuplicateError, InternalServerError, NotFoundError } from "../../../lib/appError";

const prisma = new PrismaClient();

export class AdminService {
  
  static async addAdmin(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user)   throw new NotFoundError("User not found");
      if (user.role === "ADMIN") throw new DuplicateError("User is already an admin");
      return await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    } catch (error) {
       console.log(error)
      throw  new InternalServerError("Something went error adding the user as an admin");
    }
  }

  static async removeAdmin(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (user.role !== "ADMIN") {
        throw new BadRequestError("User is not an admin");
      }

      return await prisma.user.update({
        where: { email },
        data: { role: "GUEST" },
      });
    } catch (error) {
        console.log(error)
      throw new InternalServerError("Something went wrong removing a user as an admin",);
    }
  }
}
