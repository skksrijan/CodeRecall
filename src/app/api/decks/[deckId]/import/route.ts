import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../../prisma_client';
import { Difficulty } from '@prisma/client';
import { z } from 'zod';
import { strictRateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

const ImportSchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

export async function POST(req: Request, { params }: { params: { deckId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  try {
    const { success } = await strictRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many imports requested. Please wait a minute.' }, { status: 429 });
    }
  } catch (err) {
    Sentry.captureException(err);
  }

  const user = authResult.user!;
  const deckId = params.deckId;

  try {
    const body = await req.json();
    const parsed = ImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { url } = parsed.data;

    // Check if the user owns the deck
    const deck = await prisma.deck.findUnique({
      where: { id: deckId, userId: user.id }
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    let problemsToAdd: { title: string, titleSlug: string, difficulty: Difficulty, tags: string[] }[] = [];

    // Parse LeetCode URL
    if (url.includes('/list/') || url.includes('/problem-list/')) {
      // It's a list URL
      const match = url.match(/\/(?:list|problem-list)\/([a-zA-Z0-9_-]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid list URL' }, { status: 400 });
      const slug = match[1];
      
      const query = `
        query favoriteQuestionList($favoriteSlug: String!) {
          favoriteQuestionList(favoriteSlug: $favoriteSlug) {
            questions {
              title
              titleSlug
              difficulty
              topicTags {
                name
              }
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
        difficulty: q.difficulty.toUpperCase() as Difficulty,
        tags: q.topicTags ? q.topicTags.map((t: any) => t.name) : []
      }));
    } else if (url.includes('/studyplan/') || url.includes('/study-plan/')) {
      // It's a study plan URL
      const match = url.match(/\/(?:studyplan|study-plan)\/([a-zA-Z0-9_-]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid study plan URL' }, { status: 400 });
      const slug = match[1];
      
      const query = `
        query studyPlanV2Detail($planSlug: String!) {
          studyPlanV2Detail(planSlug: $planSlug) {
            planSubGroups {
              questions {
                title
                titleSlug
                difficulty
                topicTags {
                  name
                }
              }
            }
          }
        }
      `;
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ query, variables: { planSlug: slug } })
      });
      const data = await res.json();
      
      if (!data.data?.studyPlanV2Detail?.planSubGroups) {
        return NextResponse.json({ error: 'Could not fetch problems from study plan. Make sure the plan exists.' }, { status: 400 });
      }

      data.data.studyPlanV2Detail.planSubGroups.forEach((group: any) => {
        if (group.questions) {
          group.questions.forEach((q: any) => {
            problemsToAdd.push({
              title: q.title,
              titleSlug: q.titleSlug,
              difficulty: q.difficulty.toUpperCase() as Difficulty,
              tags: q.topicTags ? q.topicTags.map((t: any) => t.name) : []
            });
          });
        }
      });

      if (problemsToAdd.length === 0) {
        return NextResponse.json({ error: 'Study plan is empty or invalid.' }, { status: 400 });
      }
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
            topicTags {
              name
            }
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
              difficulty: data.data.question.difficulty.toUpperCase() as Difficulty,
              tags: data.data.question.topicTags ? data.data.question.topicTags.map((t: any) => t.name) : []
            };
          }
        } catch (err) {
          Sentry.captureException(err);
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
            tags: {
              connectOrCreate: p.tags.map(tagName => ({
                where: { name: tagName },
                create: { name: tagName }
              }))
            },
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
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 });
  }
}
