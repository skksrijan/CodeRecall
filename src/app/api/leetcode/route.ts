import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import logger from '@/lib/logger';

const LEETCODE_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://leetcode.com',
  'Origin': 'https://leetcode.com'
};

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const idOrSlug = searchParams.get('id');
  if (!idOrSlug) {
    return NextResponse.json({ error: 'Missing id or slug parameter' }, { status: 400 });
  }

  const trimmed = idOrSlug.trim();
  const isNumeric = /^\d+$/.test(trimmed);

  try {
    if (isNumeric) {
      // Search via GraphQL problemsetQuestionList
      const query = `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            questions: data {
              frontendQuestionId: questionFrontendId
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
        headers: LEETCODE_HEADERS,
        body: JSON.stringify({
          query,
          variables: {
            categorySlug: "",
            skip: 0,
            limit: 20,
            filters: { searchKeywords: trimmed }
          }
        })
      });

      if (!res.ok) throw new Error('LeetCode GraphQL request failed');
      const data = await res.json();
      const questions = data.data?.problemsetQuestionList?.questions || [];

      // Find exact frontendQuestionId match
      const matched = questions.find((q: any) => q.frontendQuestionId === trimmed) || questions[0];

      if (!matched) {
        return NextResponse.json({ error: 'Problem not found on LeetCode' }, { status: 404 });
      }

      return NextResponse.json({
        title: matched.title,
        difficulty: matched.difficulty.toUpperCase(),
        url: `https://leetcode.com/problems/${matched.titleSlug}/`,
        tags: matched.topicTags ? matched.topicTags.map((t: any) => t.name) : []
      });
    } else {
      // Treat as slug
      const slug = trimmed.toLowerCase().replace(/^\/problems\//, '').replace(/\/$/, '');
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

      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: LEETCODE_HEADERS,
        body: JSON.stringify({ query, variables: { titleSlug: slug } })
      });

      if (!res.ok) throw new Error('LeetCode GraphQL request failed');
      const data = await res.json();
      const q = data.data?.question;

      if (!q) {
        return NextResponse.json({ error: 'Problem not found on LeetCode' }, { status: 404 });
      }

      return NextResponse.json({
        title: q.title,
        difficulty: q.difficulty.toUpperCase(),
        url: `https://leetcode.com/problems/${slug}/`,
        tags: q.topicTags ? q.topicTags.map((t: any) => t.name) : []
      });
    }
  } catch (error: any) {
    logger.error({ err: error }, 'Error fetching LeetCode problem details');
    return NextResponse.json({ error: 'Failed to fetch problem from LeetCode' }, { status: 500 });
  }
}
