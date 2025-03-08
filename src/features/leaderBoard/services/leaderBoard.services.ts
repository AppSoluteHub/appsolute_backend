import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLeaderboard = async () => {
  return await prisma.user.findMany({
    orderBy: { totalScore: "desc" },
    take: 10,
    select: {
      id: true,
      fullName: true,
      totalScore: true,
      
    },
  });
};

export const updateUserScore = async (userId: string, points: number) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { totalScore: { increment: points } },
    });

    // Refresh leaderboard cache immediately
    await refreshLeaderboard();
  } catch (error) {
    console.error("Error updating user score:", error);
    throw new Error("Failed to update user score");
  }
};

// Function to refresh leaderboard cache
export let cachedLeaderboard: any = null;
export let lastUpdated: number = 0;

export const refreshLeaderboard = async () => {
  try {
    cachedLeaderboard = await getLeaderboard();
    lastUpdated = Date.now();
  } catch (error) {
    console.error("Error refreshing leaderboard:", error);
  }
};

// Initial fetch to populate cache
refreshLeaderboard();
