import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const decks = await prisma.deck.findMany({
      where: { userId: authResult.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { problems: true }
        }
      }
    });
    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        description,
        userId: authResult.user!.id,
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
