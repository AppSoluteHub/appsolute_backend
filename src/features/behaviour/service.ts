import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../../lib/appError';

export class BehaviorService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async logHomepageView(userId: string | undefined, device: string): Promise<void> {
    try {
      await this.prisma.userBehavior.create({
        data: {
          userId,
          interaction: 'VIEW',
          page: 'HOME', 
          device,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestError('Failed to log homepage view');
    }
  }
}