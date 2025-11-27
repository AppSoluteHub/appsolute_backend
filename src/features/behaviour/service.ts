import { prisma } from '../../utils/prisma';

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
