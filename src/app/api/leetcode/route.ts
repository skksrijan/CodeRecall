import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import logger from '@/lib/logger';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get('id');
  if (!idStr) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    // Fetch all problems (Next.js automatically caches this fetch for 1 hour)
    const res = await fetch('https://leetcode.com/api/problems/all/', {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch from LeetCode API');
    }

    const data = await res.json();
    const problems = data.stat_status_pairs;

    // Find the specific problem by frontend ID
    const problem = problems.find((p: any) => p.stat.frontend_question_id === id);

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Map difficulty (1 = Easy, 2 = Medium, 3 = Hard)
    const difficultyMap: Record<number, string> = {
      1: 'EASY',
      2: 'MEDIUM',
      3: 'HARD'
    };

    const result = {
      title: problem.stat.question__title,
      difficulty: difficultyMap[problem.difficulty.level] || 'MEDIUM',
      url: `https://leetcode.com/problems/${problem.stat.question__title_slug}/`
    };

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error({ err: error }, 'Error fetching LeetCode details');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
