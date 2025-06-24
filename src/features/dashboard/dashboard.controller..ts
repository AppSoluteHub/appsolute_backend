import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const now         = new Date();
    const year        = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear   = new Date(year, 11, 31, 23, 59, 59);

  
    const monthlyPageviewsRaw = await prisma.$queryRaw<
      { month: number; count: number }[]
    >`
      SELECT
        EXTRACT(MONTH FROM "timestamp") AS month,
        COUNT(*) AS count
      FROM "UserBehavior"
      WHERE "interaction" = 'VIEW'
        AND "timestamp" BETWEEN ${startOfYear} AND ${endOfYear}
      GROUP BY month
      ORDER BY month;
    `;


    const siteTraffic = Array.from({ length: 12 }, (_, i) => {
      const row = monthlyPageviewsRaw.find(r => Number(r.month) === i + 1);
      const monthShort = new Date(year, i).toLocaleString('default', { month: 'short' });

      return {
        date: monthShort,
        value: row ? Number(row.count) : 0,
        fullDate: `${monthShort} ${year}`
      };
    });

    const totalPageviews = siteTraffic.reduce((sum, m) => sum + m.value, 0);

 
    const monthlyUsersRaw = await prisma.$queryRaw<
      { month: number; count: number }[]
    >`
      SELECT
        EXTRACT(MONTH FROM "joined") AS month,
        COUNT(*) AS count
      FROM "User"
      WHERE "joined" BETWEEN ${startOfYear} AND ${endOfYear}
      GROUP BY month
      ORDER BY month;
    `;

    const monthlyUsers = monthlyUsersRaw.reduce((sum, r) => sum + Number(r.count), 0);

  
    const [totalPosts, totalTasks] = await Promise.all([
      prisma.post.count(),
      prisma.task.count()
    ]);

   
    const topArticlesRaw = await prisma.post.findMany({
      take: 3,
      orderBy: {
        comments: { _count: 'desc' }
      },
      include: {
        comments: { select: { id: true } },
        categories: {
          include: { category: true }
        }
      }
    });

    const topArticles = topArticlesRaw.map(p => ({
      title: p.title,
      postDate: p.createdAt,
      category: p.categories.length > 0 ? p.categories[0].category.name : null,
      commentsCount: p.comments.length,
      imageUrl: p.imageUrl || null
    }));

 
    const deviceUsage = null;

 
    res.status(200).json({
      metrics: {
        pageviews: totalPageviews,
        monthlyUsers,
        posts: totalPosts,
        totalTasks
      },
      siteTraffic: {
        total: totalPageviews,
        monthlyData: siteTraffic
      },
      topArticles,
      deviceUsage
    });

  } catch (err) {
    console.error('[Dashboard] Error loading summary:', err);
    res.status(500).json({ message: 'Unable to load dashboard data' });
  }
}
