import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const problems = await prisma.problem.findMany({
      where: {
        userId: authResult.user!.id,
        reviewState: {
          nextReviewDate: {
            lte: new Date(),
          },
        },
      },
      include: {
        tags: true,
        reviewState: true,
      },
      orderBy: {
        reviewState: {
          nextReviewDate: 'asc',
        },
      },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
