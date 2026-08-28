import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const user = authResult.user!;
  const { searchParams } = new URL(req.url);
  const deckId = searchParams.get('deckId');

  try {
    if (deckId) {
      // DECK-SPECIFIC STUDY MODE:
      // Strictly and only pull problems belonging to this specific deck!
      const deckFilter = {
        userId: user.id,
        decks: { some: { id: deckId } },
      };

      // 1. Due review problems in this deck (nextReviewDate <= now, repetitions > 0)
      const rawReviewCards = await prisma.problem.findMany({
        where: {
          ...deckFilter,
          reviewState: {
            nextReviewDate: { lte: new Date() },
            repetitions: { gt: 0 }
          }
        },
        include: { tags: true, reviewState: true },
        orderBy: { reviewState: { nextReviewDate: 'asc' } }
      });

      const reviewCards = rawReviewCards.map((card) => ({
        ...card,
        _cardType: 'review' as const,
      }));

      // 2. Unreviewed / brand new problems in this deck (repetitions === 0 or no reviewState)
      // Unconstrained by global daily limit so users can practice all deck problems immediately!
      const rawNewCards = await prisma.problem.findMany({
        where: {
          ...deckFilter,
          OR: [
            { reviewState: null },
            { reviewState: { repetitions: 0 } }
          ]
        },
        include: { tags: true, reviewState: true },
        orderBy: { createdAt: 'asc' }
      });

      const newCards = rawNewCards.map((card) => ({
        ...card,
        _cardType: 'new' as const,
      }));

      // 3. Fallback: If no cards are due and none are unreviewed, provide the rest of the deck cards for on-demand practice
      let fallbackCards: any[] = [];
      if (reviewCards.length === 0 && newCards.length === 0) {
        const allDeckCards = await prisma.problem.findMany({
          where: deckFilter,
          include: { tags: true, reviewState: true },
          orderBy: { reviewState: { nextReviewDate: 'asc' } }
        });
        fallbackCards = allDeckCards.map((card) => ({
          ...card,
          _cardType: 'review' as const,
        }));
      }

      const combinedQueue = [...reviewCards, ...newCards, ...fallbackCards];

      return new NextResponse(JSON.stringify(combinedQueue), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'x-mode': 'deck_practice',
          'x-deck-id': deckId,
        }
      });
    }

    // GLOBAL DAILY REVIEW QUEUE (SM-2 Spaced Repetition Mode)
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const dailyNewLimit = dbUser?.dailyNewLimit ?? 5;

    // Fetch review cards due today across all decks
    const rawReviewCards = await prisma.problem.findMany({
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

    const reviewCards = rawReviewCards.map((card) => ({
      ...card,
      _cardType: 'review' as const,
    }));

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

    // Total unstudied cards remaining in user's library
    const totalUnstudiedCards = await prisma.problem.count({
      where: {
        userId: user.id,
        OR: [
          { reviewState: null },
          { reviewState: { repetitions: 0 } }
        ]
      }
    });

    const remainingNewCards = Math.max(0, dailyNewLimit - newCardsReviewedToday);

    let newCards: any[] = [];
    if (remainingNewCards > 0) {
      const rawNewCards = await prisma.problem.findMany({
        where: {
          userId: user.id,
          OR: [
            { reviewState: null },
            { reviewState: { repetitions: 0 } }
          ]
        },
        include: { tags: true, reviewState: true },
        orderBy: { createdAt: 'asc' },
        take: remainingNewCards
      });

      newCards = rawNewCards.map((card) => ({
        ...card,
        _cardType: 'new' as const,
      }));
    }

    const combinedQueue = [...reviewCards, ...newCards];
    const isQuotaExhausted = remainingNewCards === 0 && totalUnstudiedCards > 0;

    return new NextResponse(JSON.stringify(combinedQueue), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-mode': 'global_daily',
        'x-quota-exhausted': isQuotaExhausted ? 'true' : 'false',
        'x-unstudied-count': String(totalUnstudiedCards),
        'x-daily-limit': String(dailyNewLimit),
        'x-new-reviewed-today': String(newCardsReviewedToday),
      }
    });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
