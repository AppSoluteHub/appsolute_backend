import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LeaderboardService {
  /**
   * Create a new leaderboard entry for a user.
   * @param userId - The user's ID.
   * @param score - The initial score for the user (default is 0).
   * @param answered - The number of questions answered (default is 0).
   */
  static async createLeaderboard(
    userId: string,
    score = 0,
    answered = 0
  ): Promise<void> {
    // Check if the leaderboard entry already exists for the user
    const existingEntry = await prisma.leaderboard.findUnique({
      where: { userId },
    });

    if (existingEntry) {
      throw new Error(`Leaderboard entry already exists for user with ID ${userId}`);
    }

    // Verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },  // Ensure fullName is accessible
    });

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    // Create the new leaderboard entry
    await prisma.leaderboard.create({
      data: {
        userId,
        score,
        answered,
        rank: 0, // Will be recalculated after entry
      },
    });

    // Recalculate rankings
    await LeaderboardService.recalculateRankings();
  }

  /**
   * Add or update user score on the leaderboard.
   * @param userId - The user's ID.
   * @param score - The score to add/update.
   */
  static async addOrUpdateScore(userId: string, score: number): Promise<void> {
    const existingEntry = await prisma.leaderboard.findUnique({
      where: { userId },
    });

    if (existingEntry) {
      await prisma.leaderboard.update({
        where: { userId },
        data: {
          score: existingEntry.score + score,
          answered: existingEntry.answered + 1,
        },
      });
    } else {
      await prisma.leaderboard.create({
        data: {
          userId,
          score,
          answered: 1,
          rank: 0,
        },
      });
    }

    await LeaderboardService.recalculateRankings();
  }

  /**
   * Fetch leaderboard rankings with pagination.
   * @param page - Page number (default is 1).
   * @param limit - Number of entries per page (default is 10).
   */
  static async fetchLeaderboard(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const leaderboard = await prisma.leaderboard.findMany({
      skip: offset,
      take: limit,
      orderBy: { score: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    const totalCount = await prisma.leaderboard.count();

    return {
      total: totalCount,
      page,
      limit,
      leaderboard,
    };
  }

  /**
   * Reset leaderboard (e.g., for weekly/monthly reset).
   */
  static async resetLeaderboard(): Promise<void> {
    await prisma.leaderboard.deleteMany();
  }

  /**
   * Recalculate rankings after score updates.
   */
  private static async recalculateRankings(): Promise<void> {
    const leaderboardEntries = await prisma.leaderboard.findMany({
      orderBy: { score: 'desc' },
    });

    let rank = 1;

    for (const entry of leaderboardEntries) {
      await prisma.leaderboard.update({
        where: { id: entry.id },
        data: { rank: rank++ },
      });
    }
  }
}
