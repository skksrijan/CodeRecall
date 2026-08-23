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


const DeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(100),
  description: z.string().optional(),
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
    const parsed = DeckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { name, description } = parsed.data;

    const deck = await prisma.deck.create({
      data: {
        name,
        description,
        userId: authResult.user!.id,
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
