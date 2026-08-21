import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';

export async function GET(req: Request, { params }: { params: { deckId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
    });

    if (!deck || deck.userId !== authResult.user!.id) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { deckId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    // Verify ownership
    const deck = await prisma.deck.findUnique({ where: { id: params.deckId } });
    if (!deck || deck.userId !== authResult.user!.id) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const updatedDeck = await prisma.deck.update({
      where: { id: params.deckId },
      data: { name, description },
    });

    return NextResponse.json(updatedDeck);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { deckId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    // Verify ownership
    const deck = await prisma.deck.findUnique({ where: { id: params.deckId } });
    if (!deck || deck.userId !== authResult.user!.id) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    await prisma.deck.delete({
      where: { id: params.deckId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
