import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserBehaviorService {
  async trackInteraction(userId: string | null, interaction: string, page: string, device: string) {
    return await prisma.userBehavior.create({
      data: {
        userId,
        interaction,
        page,
        device,
      },
    });
  }
}

export const userBehaviorService = new UserBehaviorService();
