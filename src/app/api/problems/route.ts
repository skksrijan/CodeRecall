import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const deckId = searchParams.get('deckId');

  try {
    const problems = await prisma.problem.findMany({
      where: {
        userId: authResult.user!.id,
        ...(deckId ? { decks: { some: { id: deckId } } } : {}),
      },
      include: {
        tags: true,
        reviewState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


const ProblemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  leetcodeUrl: z.string().url().optional().or(z.literal('')),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  notes: z.string().optional(),
  userSolution: z.string().optional(),
  language: z.string().optional(),
  deckIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
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
    // If Redis fails, log it but don't block the request
    Sentry.captureException(err);
  }

  try {
    const body = await req.json();
    const parsed = ProblemSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { title, leetcodeUrl, difficulty, notes, userSolution, language, deckIds, tags } = parsed.data;

    const problem = await prisma.problem.create({
      data: {
        title,
        leetcodeUrl: leetcodeUrl || undefined,
        difficulty,
        notes,
        userSolution,
        language,
        userId: authResult.user!.id,
        decks: {
          connect: (deckIds || []).map((id: string) => ({ id })),
        },
        tags: {
          connectOrCreate: (tags || []).map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        reviewState: {
          create: {
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReviewDate: new Date(), // due immediately
          },
        },
      },
      include: {
        tags: true,
        reviewState: true,
      }
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
