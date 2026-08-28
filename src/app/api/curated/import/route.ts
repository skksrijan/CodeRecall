import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../prisma_client';
import { CURATED_LISTS } from '@/lib/curatedLists';
import { Difficulty } from '@prisma/client';
import { z } from 'zod';

const CuratedImportSchema = z.object({
  listId: z.string().min(1, 'List ID is required'),
  targetDeckId: z.string().optional(),
  familiarity: z.enum(['all_new', 'mixed', 'studied']).optional().default('all_new'),
});

export async function POST(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const user = authResult.user!;

  try {
    const body = await req.json();
    const parsed = CuratedImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { listId, targetDeckId, familiarity } = parsed.data;
    const curatedList = CURATED_LISTS.find(l => l.id === listId);

    if (!curatedList) {
      return NextResponse.json({ error: 'Curated list not found' }, { status: 404 });
    }

    let deckId = targetDeckId;

    // If no target deck provided, create a new deck with the curated list name
    if (!deckId) {
      const existingDeck = await prisma.deck.findFirst({
        where: { userId: user.id, name: curatedList.name }
      });

      if (existingDeck) {
        deckId = existingDeck.id;
      } else {
        const newDeck = await prisma.deck.create({
          data: {
            userId: user.id,
            name: curatedList.name,
            description: curatedList.description
          }
        });
        deckId = newDeck.id;
      }
    } else {
      // Verify ownership of provided deck
      const userDeck = await prisma.deck.findUnique({
        where: { id: deckId, userId: user.id }
      });
      if (!userDeck) {
        return NextResponse.json({ error: 'Target deck not found' }, { status: 404 });
      }
    }

    const now = new Date();
    let initialInterval = 1;
    let initialRepetitions = 0;
    let initialNextReviewDate = now;

    if (familiarity === 'studied') {
      initialInterval = 3;
      initialRepetitions = 1;
      initialNextReviewDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    }

    let addedCount = 0;

    // Process each problem in transaction / batch
    for (const prob of curatedList.problems) {
      const leetcodeUrl = `https://leetcode.com/problems/${prob.titleSlug}/`;

      // Check if problem already exists for this user
      let problem = await prisma.problem.findFirst({
        where: {
          userId: user.id,
          OR: [
            { title: prob.title },
            { leetcodeUrl }
          ]
        },
        include: { decks: true }
      });

      if (!problem) {
        // Tag management
        const tagConnectOrCreate = (prob.tags || []).map(tagName => ({
          where: { name: tagName.toLowerCase() },
          create: { name: tagName.toLowerCase() }
        }));

        problem = await prisma.problem.create({
          data: {
            userId: user.id,
            title: prob.title,
            difficulty: prob.difficulty as Difficulty,
            leetcodeUrl,
            decks: {
              connect: { id: deckId }
            },
            tags: {
              connectOrCreate: tagConnectOrCreate
            },
            reviewState: {
              create: {
                interval: initialInterval,
                repetitions: initialRepetitions,
                easeFactor: 2.5,
                nextReviewDate: initialNextReviewDate
              }
            }
          },
          include: { decks: true }
        });
        addedCount++;
      } else {
        // Connect to deck if not already connected
        const isConnected = problem.decks.some((d: any) => d.id === deckId);
        if (!isConnected) {
          await prisma.problem.update({
            where: { id: problem.id },
            data: {
              decks: {
                connect: { id: deckId }
              }
            }
          });
          addedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      deckId,
      deckName: curatedList.name,
      addedCount,
      totalCount: curatedList.problems.length,
      message: `Successfully imported "${curatedList.name}" (${addedCount} new problems added).`
    });
  } catch (error) {
    console.error('Curated import error:', error);
    return NextResponse.json({ error: 'Failed to import curated repertoire' }, { status: 500 });
  }
}
