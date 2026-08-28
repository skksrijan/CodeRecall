'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ decks: 0, problems: 0, due: 0, reviewCount: 0, newCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(async (token) => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const [decksRes, countRes] = await Promise.all([
            fetch('/api/decks', { headers }),
            fetch('/api/reviews/queue/count', { headers })
          ]);
          
          let decksCount = 0;
          let problemsCount = 0;
          let dueCount = 0;
          let reviewCount = 0;
          let newCount = 0;

          if (decksRes.ok) {
            const decksData = await decksRes.json();
            decksCount = decksData.length;
            problemsCount = decksData.reduce((acc: number, d: any) => acc + (d._count?.problems || 0), 0);
          }
          if (countRes.ok) {
            const countData = await countRes.json();
            dueCount = countData.total ?? countData.count ?? 0;
            reviewCount = countData.reviewCount ?? 0;
            newCount = countData.newCount ?? 0;
          }

          setStats({ decks: decksCount, problems: problemsCount, due: dueCount, reviewCount, newCount });
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      });
    }
  }, [user]);

  const firstName = (user?.displayName || user?.email || 'Engineer').split(' ')[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              SM-2 ACTIVE RECALL ENGINE
            </span>
            <span className="font-mono text-xs text-muted-text">
              • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-mono">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs text-muted-text mt-0.5">
            Your algorithm memory index and daily spaced review queue.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <Link
            href="/app/decks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface transition-colors shadow-sm uppercase tracking-wider"
          >
            [ Card Decks ]
          </Link>
          {stats.due > 0 && (
            <Link
              href="/app/study"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-text text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm uppercase tracking-wider"
            >
              Drill Queue ({stats.due}) -&gt;
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Metric 1: Queue Urgency */}
        <div className={`p-5 rounded-xl border transition-all ${
          stats.due > 0 ? 'bg-surface border-recall-due/40 shadow-sm' : 'bg-surface border-border'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">
              [01] Queue Load Today
            </span>
            {stats.due > 0 ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-recall-due/15 text-recall-due border border-recall-due/30">
                ACTION REQUIRED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success border border-success/30">
                ALL CLEARED
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-text mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse" /> : stats.due}
          </div>
          <div className="text-xs text-muted-text flex items-center gap-2">
            {stats.due > 0 ? (
              <>
                <span className="text-recall-due font-bold">{stats.reviewCount} due reviews</span>
                <span>•</span>
                <span>{stats.newCount} new intake</span>
              </>
            ) : (
              <span>Zero pending memory lapses today</span>
            )}
          </div>
        </div>

        {/* Metric 2: Practice Decks */}
        <div className="p-5 rounded-xl bg-surface border border-border">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">
              [02] Active Decks
            </span>
            <span className="text-[10px] text-muted-text">COLLECTIONS</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-text mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse" /> : stats.decks}
          </div>
          <p className="text-xs text-muted-text">
            Organized pattern collections
          </p>
        </div>

        {/* Metric 3: Indexed Problems */}
        <div className="p-5 rounded-xl bg-surface border border-border">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">
              [03] Indexed Corpus
            </span>
            <span className="text-[10px] text-muted-text">TOTAL CARDS</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-text mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse" /> : stats.problems}
          </div>
          <p className="text-xs text-muted-text">
            Total algorithmic cards indexed
          </p>
        </div>
      </div>

      {/* Main Focus Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Study Action Callout Card */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-text text-background flex items-center justify-center font-mono font-bold text-xs">
                SM2
              </div>
              <div>
                <h2 className="text-base font-bold text-text font-mono">Daily Spaced Repetition Drill</h2>
                <p className="text-xs text-muted-text">
                  Algorithm calculates personalized intervals to prevent Ebbinghaus memory decay.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background border border-border space-y-2 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-text">Session Forecast:</span>
                <span className="font-semibold text-text">
                  {stats.due > 0 ? `~${Math.ceil(stats.due * 2.5)} mins expected` : 'Optimal recall maintained'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-text">Review Urgency:</span>
                <span className="font-semibold text-text">
                  {stats.reviewCount > 0 ? `${stats.reviewCount} critical reviews pending` : 'Zero overdue items'}
                </span>
              </div>
            </div>
          </div>

          <div>
            {stats.due > 0 ? (
              <Link
                href="/app/study"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-text text-background font-semibold text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
              >
                Begin Daily Drill ({stats.due} Cards) -&gt;
              </Link>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-mono">
                <span>
                  [✓] All queued reviews completed for today!
                </span>
                <Link href="/app/decks" className="underline font-semibold hover:opacity-80">
                  Explore Decks -&gt;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Tooling Actions */}
        <div className="lg:col-span-5 space-y-3 font-mono">
          <div className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
            <Link href="/app/decks" className="flex items-start justify-between group">
              <div className="space-y-1">
                <div className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                  [ 01 // MANAGE CARD DECKS ]
                </div>
                <p className="text-xs text-muted-text font-sans">
                  Create custom decks, organize tags, or drill specific algorithmic topics.
                </p>
              </div>
              <span className="text-xs text-muted-text group-hover:text-text mt-1">-&gt;</span>
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
            <Link href="/app/stats" className="flex items-start justify-between group">
              <div className="space-y-1">
                <div className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                  [ 02 // RETENTION ANALYTICS ]
                </div>
                <p className="text-xs text-muted-text font-sans">
                  Inspect 7-day upcoming review load, 90-day heatmaps, and pattern retention.
                </p>
              </div>
              <span className="text-xs text-muted-text group-hover:text-text mt-1">-&gt;</span>
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors">
            <Link href="/app/settings" className="flex items-start justify-between group">
              <div className="space-y-1">
                <div className="text-xs font-bold text-text group-hover:text-primary transition-colors">
                  [ 03 // INTAKE &amp; PACING LIMITS ]
                </div>
                <p className="text-xs text-muted-text font-sans">
                  Adjust maximum daily new cards to protect against review overload.
                </p>
              </div>
              <span className="text-xs text-muted-text group-hover:text-text mt-1">-&gt;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
