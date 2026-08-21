import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';
import { Difficulty } from '@prisma/client';

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

export async function POST(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const { title, leetcodeUrl, difficulty, notes, userSolution, language, deckIds, tags } = body;

    if (!title || !difficulty) {
      return NextResponse.json({ error: 'Title and difficulty are required' }, { status: 400 });
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        leetcodeUrl,
        difficulty: difficulty as Difficulty,
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
    console.error('Error creating problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
