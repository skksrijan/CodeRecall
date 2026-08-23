import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const user = authResult.user!;
    
    // Fetch Decks
    const decks = await prisma.deck.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, description: true }
    });

    // Fetch Problems with Tags
    const problems = await prisma.problem.findMany({
      where: { userId: user.id },
      select: { 
        id: true, 
        title: true, 
        difficulty: true,
        tags: { select: { name: true } }
      }
    });

    return NextResponse.json({ decks, problems });
  } catch (error) {
    console.error('Error fetching search data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
