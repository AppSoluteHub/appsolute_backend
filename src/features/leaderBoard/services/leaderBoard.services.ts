import { prisma } from "../../../utils/prisma";

export const getLeaderboard = async () => {
  return await prisma.user.findMany({
    orderBy: { totalScore: "desc" },
    take: 10,
    select: {
      id: true,
      fullName: true,
      totalScore: true,
      answered: true,
      joined : true,
      profileImage: true
    },
  });
};
