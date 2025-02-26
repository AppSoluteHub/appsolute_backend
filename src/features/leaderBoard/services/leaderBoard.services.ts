
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
