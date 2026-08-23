import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../../prisma_client';
import { Difficulty } from '@prisma/client';

export async function POST(req: Request, { params }: { params: { deckId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const user = authResult.user!;
  const deckId = params.deckId;

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if the user owns the deck
    const deck = await prisma.deck.findUnique({
      where: { id: deckId, userId: user.id }
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    let problemsToAdd: { title: string, titleSlug: string, difficulty: Difficulty }[] = [];

    // Parse LeetCode URL
    if (url.includes('/list/')) {
      // It's a list URL
      const match = url.match(/\/list\/([a-zA-Z0-9_-]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid list URL' }, { status: 400 });
      const slug = match[1];
      
      const query = `
        query favoriteQuestionList($favoriteSlug: String!) {
          favoriteQuestionList(favoriteSlug: $favoriteSlug) {
            questions {
              title
              titleSlug
              difficulty
            }
          }
        }
      `;
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ query, variables: { favoriteSlug: slug } })
      });
      const data = await res.json();
      
      if (!data.data?.favoriteQuestionList?.questions || data.data.favoriteQuestionList.questions.length === 0) {
        return NextResponse.json({ error: 'Could not fetch problems from list. Make sure the list is public.' }, { status: 400 });
      }

      problemsToAdd = data.data.favoriteQuestionList.questions.map((q: any) => ({
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty.toUpperCase() as Difficulty
      }));
    } else if (url.includes('/problems/')) {
      // Find all problem slugs in the input text
      const regex = /\/problems\/([a-zA-Z0-9_-]+)/g;
      const slugs = new Set<string>();
      let match;
      while ((match = regex.exec(url)) !== null) {
        slugs.add(match[1]);
      }

      if (slugs.size === 0) {
        return NextResponse.json({ error: 'No valid problem URLs found' }, { status: 400 });
      }

      const query = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            difficulty
          }
        }
      `;

      // Fetch all problems in parallel
      const fetchPromises = Array.from(slugs).map(async (slug) => {
        try {
          const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
            body: JSON.stringify({ query, variables: { titleSlug: slug } })
          });
          const data = await res.json();
          if (data.data?.question) {
            return {
              title: data.data.question.title,
              titleSlug: slug,
              difficulty: data.data.question.difficulty.toUpperCase() as Difficulty
            };
          }
        } catch (err) {
          console.error(`Failed to fetch ${slug}`, err);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      problemsToAdd = results.filter((p): p is NonNullable<typeof p> => p !== null);

      if (problemsToAdd.length === 0) {
        return NextResponse.json({ error: 'Could not fetch any of the provided problems.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported URL format. Please paste a LeetCode List URL or one/many Problem URLs.' }, { status: 400 });
    }

    // Bulk Insert into Prisma
    const now = new Date();
    
    // We cannot use prisma.problem.createMany because we want to connect to a deck.
    // Actually, createMany doesn't support nested relations easily, so we can use a transaction.
    const createdProblems = await prisma.$transaction(
      problemsToAdd.map(p => 
        prisma.problem.create({
          data: {
            title: p.title,
            difficulty: p.difficulty,
            leetcodeUrl: `https://leetcode.com/problems/${p.titleSlug}/`,
            userId: user.id,
            decks: {
              connect: { id: deckId }
            },
            reviewState: {
              create: {
                nextReviewDate: now,
                interval: 0,
                repetitions: 0,
                easeFactor: 2.5
              }
            }
          }
        })
      )
    );

    return NextResponse.json({ message: `Imported ${createdProblems.length} problems successfully`, count: createdProblems.length });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 });
  }
}
