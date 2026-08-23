import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const user = authResult.user!;

  try {
    const today = new Date();

    // Count review cards due now
    const reviewCount = await prisma.reviewState.count({
      where: {
        problem: { userId: user.id },
        nextReviewDate: { lte: today },
        repetitions: { gt: 0 }
      }
    });

    // Count new cards eligible today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { dailyNewLimit: true } });
    const dailyNewLimit = dbUser?.dailyNewLimit || 5;

    const newCardsReviewedToday = await prisma.review.count({
      where: {
        userId: user.id,
        reviewedAt: { gte: startOfDay },
        previousInterval: 0
      }
    });

    const remainingNew = Math.max(0, dailyNewLimit - newCardsReviewedToday);

    const totalNew = await prisma.reviewState.count({
      where: {
        problem: { userId: user.id },
        repetitions: 0
      }
    });

    const newCount = Math.min(totalNew, remainingNew);

    return NextResponse.json({ count: reviewCount + newCount });
  } catch (error) {
    console.error('Error fetching review count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
