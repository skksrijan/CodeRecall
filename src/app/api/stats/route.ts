import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const user = authResult.user!;

  try {
    // 1. Difficulty Breakdown
    const problems = await prisma.problem.findMany({
      where: { userId: user.id },
      select: { difficulty: true }
    });

    const difficulty = {
      EASY: problems.filter(p => p.difficulty === 'EASY').length,
      MEDIUM: problems.filter(p => p.difficulty === 'MEDIUM').length,
      HARD: problems.filter(p => p.difficulty === 'HARD').length,
    };

    // 2. Upcoming Load (Next 7 days + overdue)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingReviews = await prisma.reviewState.findMany({
      where: {
        problem: { userId: user.id },
        nextReviewDate: { gte: today, lt: nextWeek }
      },
      select: { nextReviewDate: true }
    });

    const overdueReviews = await prisma.reviewState.findMany({
      where: {
        problem: { userId: user.id },
        nextReviewDate: { lt: today }
      },
      select: { nextReviewDate: true }
    });

    const upcomingLoadMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      upcomingLoadMap[d.toISOString().split('T')[0]] = 0;
    }
    
    const todayStr = today.toISOString().split('T')[0];
    upcomingLoadMap[todayStr] += overdueReviews.length;

    upcomingReviews.forEach(r => {
      const dStr = r.nextReviewDate.toISOString().split('T')[0];
      if (upcomingLoadMap[dStr] !== undefined) {
        upcomingLoadMap[dStr]++;
      }
    });

    const upcomingLoad = Object.keys(upcomingLoadMap).sort().map(date => ({
      date,
      count: upcomingLoadMap[date]
    }));

    // 3. Heatmap & Streaks (Last 90 days)
    const allReviews = await prisma.review.findMany({
      where: { userId: user.id },
      select: { reviewedAt: true },
      orderBy: { reviewedAt: 'asc' }
    });

    const heatmapMap: Record<string, number> = {};
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

    for (let i = 0; i < 90; i++) {
      const d = new Date(ninetyDaysAgo);
      d.setDate(d.getDate() + i);
      heatmapMap[d.toISOString().split('T')[0]] = 0;
    }

    const activeDays = new Set<string>();

    allReviews.forEach(r => {
      const localDate = new Date(r.reviewedAt.getTime() - (r.reviewedAt.getTimezoneOffset() * 60000));
      const dStr = localDate.toISOString().split('T')[0];
      activeDays.add(dStr);
      if (heatmapMap[dStr] !== undefined) {
        heatmapMap[dStr]++;
      }
    });

    const heatmap = Object.keys(heatmapMap).sort().map(date => ({
      date,
      count: heatmapMap[date]
    }));

    // Calculate Streak
    let currentStreak = 0;
    let longestStreak = 0;
    
    let checkDate = new Date(today);
    if (!activeDays.has(todayStr)) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (activeDays.has(yesterdayStr)) {
        checkDate = yesterday;
      }
    }

    if (activeDays.has(checkDate.toISOString().split('T')[0])) {
      while (true) {
        if (activeDays.has(checkDate.toISOString().split('T')[0])) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let tempStreak = 0;
    let prevDateStr: string | null = null;
    Array.from(activeDays).sort().forEach(dStr => {
      if (!prevDateStr) {
        tempStreak = 1;
      } else {
        const d = new Date(dStr);
        const prev = new Date(prevDateStr);
        const diffDays = Math.round((d.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDateStr = dStr;
    });

    // 4. Weak Topics Radar
    const tagsWithReviews = await prisma.tag.findMany({
      include: {
        problems: {
          where: { userId: user.id },
          include: {
            reviews: { select: { quality: true } }
          }
        }
      }
    });

    const topicStats: { name: string, avgQuality: number, reviewCount: number }[] = [];

    tagsWithReviews.forEach(tag => {
      let totalQuality = 0;
      let reviewCount = 0;
      tag.problems.forEach(p => {
        p.reviews.forEach(r => {
          totalQuality += r.quality;
          reviewCount++;
        });
      });
      if (reviewCount > 0) {
        topicStats.push({
          name: tag.name,
          avgQuality: parseFloat((totalQuality / reviewCount).toFixed(2)),
          reviewCount
        });
      }
    });

    topicStats.sort((a, b) => a.avgQuality - b.avgQuality);
    const weakTopics = topicStats.slice(0, 5);

    return NextResponse.json({
      difficulty,
      upcomingLoad,
      heatmap,
      streak: { current: currentStreak, longest: longestStreak },
      weakTopics
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
