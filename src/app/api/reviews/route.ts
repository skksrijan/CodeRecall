import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';
import { calculateSM2 } from '@/lib/sm2';
import logger from '@/lib/logger';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const ReviewSchema = z.object({
  problemId: z.string().min(1),
  quality: z.number().int().min(0).max(5),
});

export async function POST(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  try {
    const { success } = await rateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  } catch (err) {
    Sentry.captureException(err);
  }

  try {
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { problemId, quality } = parsed.data;
    const userId = authResult.user!.id;

    // Load current ReviewState
    const reviewState = await prisma.reviewState.findUnique({
      where: { problemId },
      include: { problem: true }
    });

    if (!reviewState || reviewState.problem.userId !== userId) {
      return NextResponse.json({ error: 'ReviewState not found' }, { status: 404 });
    }

    // Calculate next SM-2 step
    const sm2Result = calculateSM2({
      quality,
      repetitions: reviewState.repetitions,
      previousInterval: reviewState.interval,
      easeFactor: reviewState.easeFactor,
    });

    // Execute Prisma transaction to write log AND update state
    const [updatedState] = await prisma.$transaction([
      prisma.reviewState.update({
        where: { id: reviewState.id },
        data: {
          repetitions: sm2Result.repetitions,
          interval: sm2Result.interval,
          easeFactor: sm2Result.easeFactor,
          nextReviewDate: sm2Result.nextReviewDate,
          lastReviewedAt: new Date(),
        },
      }),
      prisma.review.create({
        data: {
          problemId,
          userId,
          quality,
          previousInterval: reviewState.interval,
          newInterval: sm2Result.interval,
          easeFactor: sm2Result.easeFactor,
          reviewCount: sm2Result.repetitions,
        },
      }),
    ]);

    logger.info({ problemId, userId, quality, newInterval: sm2Result.interval }, 'Review processed');

    return NextResponse.json(updatedState);
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error processing review');
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
