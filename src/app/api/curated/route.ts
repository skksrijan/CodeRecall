import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import { CURATED_LISTS } from '@/lib/curatedLists';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Return summaries with difficulty breakdown for each list
  const summaries = CURATED_LISTS.map(list => {
    const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
    const allTags = new Set<string>();
    
    list.problems.forEach(p => {
      if (counts[p.difficulty] !== undefined) counts[p.difficulty]++;
      p.tags.forEach(t => allTags.add(t));
    });

    return {
      id: list.id,
      name: list.name,
      badge: list.badge,
      description: list.description,
      category: list.category,
      problemCount: list.problems.length,
      difficultyCounts: counts,
      tags: Array.from(allTags).slice(0, 5)
    };
  });

  return NextResponse.json(summaries);
}
