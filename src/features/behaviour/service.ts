import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserBehaviorService {
  async trackInteraction( interaction: string, page: string, device: string) {
    return await prisma.userBehavior.create({
      data: {
        interaction,
        page,
        device,
      },
    });
  }
}

export const userBehaviorService = new UserBehaviorService();
