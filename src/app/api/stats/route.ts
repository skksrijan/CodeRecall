import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/authMiddleware';
import prisma from '../../../../prisma_client';

export async function GET(req: Request) {
  const authResult = await verifyAuth(req);
  if (authResult.error) return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  const user = authResult.user!;

  try {
    const formatLocal = (d: Date) => {
      const date = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
      return date.toISOString().split('T')[0];
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Run all independent queries in parallel
    const [
      problems,
      upcomingReviews,
      overdueReviews,
      dbUser,
      totalNewCards,
      newCardsReviewedToday,
      allReviews,
      tagsWithReviews
    ] = await Promise.all([
      // 1. Difficulty Breakdown
      prisma.problem.findMany({
        where: { userId: user.id },
        select: { difficulty: true }
      }),
      // 2. Upcoming reviews
      prisma.reviewState.findMany({
        where: {
          problem: { userId: user.id },
          nextReviewDate: { gte: today, lt: nextWeek },
          repetitions: { gt: 0 }
        },
        select: { nextReviewDate: true }
      }),
      // 3. Overdue reviews
      prisma.reviewState.findMany({
        where: {
          problem: { userId: user.id },
          nextReviewDate: { lt: today },
          repetitions: { gt: 0 }
        },
        select: { nextReviewDate: true }
      }),
      // 4. User settings
      prisma.user.findUnique({ where: { id: user.id }, select: { dailyNewLimit: true } }),
      // 5. Total new cards
      prisma.reviewState.count({
        where: {
          problem: { userId: user.id },
          repetitions: 0
        }
      }),
      // 6. New cards reviewed today
      prisma.review.count({
        where: {
          userId: user.id,
          reviewedAt: { gte: startOfDay },
          previousInterval: 0
        }
      }),
      // 7. All reviews for heatmap
      prisma.review.findMany({
        where: { userId: user.id },
        select: { reviewedAt: true },
        orderBy: { reviewedAt: 'asc' }
      }),
      // 8. Tags with reviews for weak topics
      prisma.tag.findMany({
        include: {
          problems: {
            where: { userId: user.id },
            include: {
              reviews: { select: { quality: true } }
            }
          }
        }
      })
    ]);

    // 1. Difficulty Breakdown
    const difficulty = {
      EASY: problems.filter(p => p.difficulty === 'EASY').length,
      MEDIUM: problems.filter(p => p.difficulty === 'MEDIUM').length,
      HARD: problems.filter(p => p.difficulty === 'HARD').length,
    };

    // 2. Upcoming Load
    const dailyNewLimit = dbUser?.dailyNewLimit || 5;

    const upcomingLoadMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      upcomingLoadMap[formatLocal(d)] = 0;
    }

    const todayStr = formatLocal(today);
    upcomingLoadMap[todayStr] += overdueReviews.length;

    upcomingReviews.forEach(r => {
      const dStr = formatLocal(r.nextReviewDate);
      if (upcomingLoadMap[dStr] !== undefined) {
        upcomingLoadMap[dStr]++;
      }
    });

    let remainingNewCards = totalNewCards;
    const todayAllowance = Math.max(0, dailyNewLimit - newCardsReviewedToday);

    for (let i = 0; i < 7; i++) {
      if (remainingNewCards <= 0) break;
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dStr = formatLocal(d);
      const allowance = i === 0 ? todayAllowance : dailyNewLimit;
      const toAdd = Math.min(remainingNewCards, allowance);
      upcomingLoadMap[dStr] += toAdd;
      remainingNewCards -= toAdd;
    }

    const upcomingLoad = Object.keys(upcomingLoadMap).sort().map(date => ({
      date,
      count: upcomingLoadMap[date]
    }));

    // 3. Heatmap & Streaks
    const heatmapMap: Record<string, number> = {};
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

    for (let i = 0; i < 90; i++) {
      const d = new Date(ninetyDaysAgo);
      d.setDate(d.getDate() + i);
      heatmapMap[formatLocal(d)] = 0;
    }

    const activeDays = new Set<string>();

    allReviews.forEach(r => {
      const dStr = formatLocal(r.reviewedAt);
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
      const yesterdayStr = formatLocal(yesterday);
      if (activeDays.has(yesterdayStr)) {
        checkDate = yesterday;
      }
    }

    if (activeDays.has(formatLocal(checkDate))) {
      while (true) {
        if (activeDays.has(formatLocal(checkDate))) {
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

    // 4. Weak Topics Radar (tagsWithReviews already fetched in parallel)
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
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
