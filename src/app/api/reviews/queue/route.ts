import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const user = authResult.user!;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const dailyNewLimit = dbUser?.dailyNewLimit || 5;

    // Fetch review cards (due today, repetitions > 0)
    const reviewCards = await prisma.problem.findMany({
      where: {
        userId: user.id,
        reviewState: {
          nextReviewDate: { lte: new Date() },
          repetitions: { gt: 0 }
        }
      },
      include: { tags: true, reviewState: true },
      orderBy: { reviewState: { nextReviewDate: 'asc' } }
    });

    // Check how many NEW cards were reviewed today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const newCardsReviewedToday = await prisma.review.count({
      where: {
        userId: user.id,
        reviewedAt: { gte: startOfDay },
        previousInterval: 0
      }
    });

    const remainingNewCards = Math.max(0, dailyNewLimit - newCardsReviewedToday);

    let newCards: any[] = [];
    if (remainingNewCards > 0) {
      newCards = await prisma.problem.findMany({
        where: {
          userId: user.id,
          reviewState: { repetitions: 0 }
        },
        include: { tags: true, reviewState: true },
        orderBy: { createdAt: 'asc' },
        take: remainingNewCards
      });
    }

    // Combine and sort by nextReviewDate
    const combinedQueue = [...reviewCards, ...newCards].sort((a, b) => {
      const dateA = new Date(a.reviewState!.nextReviewDate).getTime();
      const dateB = new Date(b.reviewState!.nextReviewDate).getTime();
      return dateA - dateB;
    });

    return NextResponse.json(combinedQueue);
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
