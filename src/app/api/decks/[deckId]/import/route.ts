import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../../prisma_client';
import { Difficulty } from '@prisma/client';
import { z } from 'zod';
import { strictRateLimit } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';
import { CURATED_LISTS } from '@/lib/curatedLists';

const ImportSchema = z.object({
  url: z.string().min(1, 'URL or study plan name is required'),
  familiarity: z.enum(['all_new', 'mixed', 'studied']).optional().default('all_new'),
});

const LEETCODE_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://leetcode.com',
  'Origin': 'https://leetcode.com'
};

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

    const { url, familiarity } = parsed.data;

    // Check if the user owns the deck
    const deck = await prisma.deck.findUnique({
      where: { id: deckId, userId: user.id }
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    let problemsToAdd: { title: string, titleSlug: string, difficulty: Difficulty, tags: string[] }[] = [];

    // 1. Check if user typed a curated list identifier directly (e.g. "blind-75", "top-interview-150")
    const cleanInput = url.trim().toLowerCase();
    const matchedCurated = CURATED_LISTS.find(l =>
      l.id === cleanInput ||
      cleanInput.includes(l.id) ||
      cleanInput === l.name.toLowerCase()
    );

    if (matchedCurated) {
      problemsToAdd = matchedCurated.problems.map(p => ({
        title: p.title,
        titleSlug: p.titleSlug,
        difficulty: p.difficulty as Difficulty,
        tags: p.tags
      }));
    } else if (url.includes('/studyplan/') || url.includes('/study-plan/')) {
      // 2. Study Plan URL (e.g. https://leetcode.com/studyplan/top-interview-150/)
      const match = url.match(/\/(?:studyplan|study-plan)\/([a-zA-Z0-9_-]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid study plan URL' }, { status: 400 });
      const slug = match[1];

      // Check if we have pre-curated data for this slug
      const preCurated = CURATED_LISTS.find(l => l.id === slug);
      if (preCurated) {
        problemsToAdd = preCurated.problems.map(p => ({
          title: p.title,
          titleSlug: p.titleSlug,
          difficulty: p.difficulty as Difficulty,
          tags: p.tags
        }));
      } else {
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
          headers: LEETCODE_HEADERS,
          body: JSON.stringify({ query, variables: { planSlug: slug } })
        });
        const data = await res.json();

        if (!data.data?.studyPlanV2Detail?.planSubGroups) {
          return NextResponse.json({ error: 'Could not fetch problems from study plan. Make sure the plan exists on LeetCode.' }, { status: 400 });
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
      }
    } else if (url.includes('/list/') || url.includes('/problem-list/')) {
      // 3. Problem List URL (e.g. /problem-list/75-blind/ or /list/55291811)
      const match = url.match(/\/(?:list|problem-list)\/([a-zA-Z0-9_-]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid list URL' }, { status: 400 });
      const slug = match[1];

      // Try problemsetQuestionList first (for public lists)
      const problemsetQuery = `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            questions: data {
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

      const pRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: LEETCODE_HEADERS,
        body: JSON.stringify({
          query: problemsetQuery,
          variables: { categorySlug: "", skip: 0, limit: 150, filters: { listId: slug } }
        })
      });
      const pData = await pRes.json();

      if (pData.data?.problemsetQuestionList?.questions && pData.data.problemsetQuestionList.questions.length > 0) {
        problemsToAdd = pData.data.problemsetQuestionList.questions.map((q: any) => ({
          title: q.title,
          titleSlug: q.titleSlug,
          difficulty: q.difficulty.toUpperCase() as Difficulty,
          tags: q.topicTags ? q.topicTags.map((t: any) => t.name) : []
        }));
      } else {
        // Fallback to favoriteQuestionList
        const favQuery = `
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
        const fRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: LEETCODE_HEADERS,
          body: JSON.stringify({ query: favQuery, variables: { favoriteSlug: slug } })
        });
        const fData = await fRes.json();

        if (fData.data?.favoriteQuestionList?.questions && fData.data.favoriteQuestionList.questions.length > 0) {
          problemsToAdd = fData.data.favoriteQuestionList.questions.map((q: any) => ({
            title: q.title,
            titleSlug: q.titleSlug,
            difficulty: q.difficulty.toUpperCase() as Difficulty,
            tags: q.topicTags ? q.topicTags.map((t: any) => t.name) : []
          }));
        }
      }

      if (problemsToAdd.length === 0) {
        return NextResponse.json({ error: 'Could not fetch problems from list. Make sure the list is public on LeetCode.' }, { status: 400 });
      }
    } else if (url.includes('/problems/')) {
      // 4. Direct problem URLs
      const regex = /\/problems\/([a-zA-Z0-9_-]+)/g;
      const slugs = new Set<string>();
      let m;
      while ((m = regex.exec(url)) !== null) {
        slugs.add(m[1]);
      }

      if (slugs.size === 0) {
        return NextResponse.json({ error: 'No valid problem slugs found in input' }, { status: 400 });
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

      const fetchPromises = Array.from(slugs).map(async (slug) => {
        try {
          const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: LEETCODE_HEADERS,
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
        return NextResponse.json({ error: 'Could not fetch problem details from LeetCode.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported URL format. Please paste a LeetCode Study Plan, Problem List, or Problem URL.' }, { status: 400 });
    }

    if (problemsToAdd.length === 0) {
      return NextResponse.json({ error: 'No problems found to import.' }, { status: 400 });
    }

    // Initialize SM-2 parameters
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

    for (const prob of problemsToAdd) {
      const leetcodeUrl = `https://leetcode.com/problems/${prob.titleSlug}/`;

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
        const tagConnectOrCreate = (prob.tags || []).map(tagName => ({
          where: { name: tagName.toLowerCase() },
          create: { name: tagName.toLowerCase() }
        }));

        problem = await prisma.problem.create({
          data: {
            userId: user.id,
            title: prob.title,
            difficulty: prob.difficulty,
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
        const isConnected = problem.decks.some(d => d.id === deckId);
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
      addedCount,
      totalCount: problemsToAdd.length,
      message: `Successfully imported ${addedCount} problems into "${deck.name}".`
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to process import.' }, { status: 500 });
  }
}
