import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../../../prisma_client';
import logger from '@/lib/logger';

const LEETCODE_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://leetcode.com',
  'Origin': 'https://leetcode.com'
};

export async function GET(req: Request, { params }: { params: { problemId: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const problemId = params.problemId;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId, userId: authResult.user!.id }
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    if (problem.description) {
      return NextResponse.json({ description: problem.description });
    }

    if (!problem.leetcodeUrl) {
      return NextResponse.json({ description: 'No description available.' });
    }

    // Extract titleSlug from leetcodeUrl
    const match = problem.leetcodeUrl.match(/\/problems\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      return NextResponse.json({ description: 'No description available (Invalid URL).' });
    }
    const slug = match[1];

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          content
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: LEETCODE_HEADERS,
      body: JSON.stringify({ query, variables: { titleSlug: slug } })
    });
    
    if (!res.ok) throw new Error('LeetCode GraphQL fetch failed');
    const data = await res.json();
    const content = data.data?.question?.content;

    if (!content) {
      return NextResponse.json({ description: 'Description not found on LeetCode.' });
    }

    // Save to database
    await prisma.problem.update({
      where: { id: problemId },
      data: { description: content }
    });

    return NextResponse.json({ description: content });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching problem description');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
