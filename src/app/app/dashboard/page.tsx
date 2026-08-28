'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ due: 0, decks: 0, problems: 0, reviewCount: 0, newCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        fetch('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setStats({
                due: (data.dueToday || 0) + (data.newToday || 0),
                reviewCount: data.dueToday || 0,
                newCount: data.newToday || 0,
                decks: data.decksCount || 0,
                problems: data.problemsCount || 0
              });
            }
          })
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
      });
    }
  }, [user]);

  const firstName = (user?.displayName || user?.email || 'Engineer').split(' ')[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs text-muted-text mt-1">
            Your algorithm review queue and practice decks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/app/decks"
            className="inline-flex items-center px-3.5 py-2 rounded-lg border border-border text-xs font-semibold text-text hover:bg-surface transition-colors shadow-sm"
          >
            Browse Decks
          </Link>
          <Link
            href="/app/study"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-text text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            {stats.due > 0 ? `Start Practice (${stats.due}) ->` : 'Practice Queue ->'}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 01: Due Queue */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-text font-medium">Daily Review Queue</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${stats.due > 0 ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
              {stats.due > 0 ? 'Due Today' : 'Completed'}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-text mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse" /> : stats.due}
          </div>
          <p className="text-xs text-muted-text">
            {stats.due > 0 ? `${stats.reviewCount} reviews • ${stats.newCount} new cards` : 'All caught up for today'}
          </p>
        </div>

        {/* Metric 02: Active Decks */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-text font-medium">Practice Decks</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-background text-muted-text border border-border">
              Collections
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-text mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse" /> : stats.decks}
          </div>
          <p className="text-xs text-muted-text">
            Configured problem decks
          </p>
        </div>

        {/* Metric 03: Total Problems */}
        <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-text font-medium">Total Problems</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-background text-muted-text border border-border">
              Indexed
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tabular-nums text-text mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse" /> : stats.problems}
          </div>
          <p className="text-xs text-muted-text">
            Total cards in your library
          </p>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-text">Daily Spaced Review</h2>
              <p className="text-xs text-muted-text mt-0.5">
                Review problems at optimal intervals to reinforce memory and pattern recognition.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Estimated Time:</span>
                <span className="font-semibold text-text">
                  {stats.due > 0 ? `~${Math.ceil(stats.due * 2.5)} mins` : 'Queue clear'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Status:</span>
                <span className="font-semibold text-text">
                  {stats.due > 0 ? `${stats.due} cards ready for recall` : 'All scheduled reviews completed'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Link
              href="/app/study"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-text text-background font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm"
            >
              {stats.due > 0 ? 'Start Review Session ->' : 'Review Ahead ->'}
            </Link>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-base font-bold text-text">Quick Actions</h2>
            <p className="text-xs text-muted-text mt-0.5">
              Add new problem cards or explore curated collections.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <Link
              href="/app/decks"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors"
            >
              <div>
                <p className="font-semibold text-text">Curated Problem Lists</p>
                <p className="text-[11px] text-muted-text">Add Blind 75, Top 150, or LeetCode 75 in 1 click</p>
              </div>
              <span className="text-muted-text">Explore -&gt;</span>
            </Link>

            <Link
              href="/app/stats"
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-surface transition-colors"
            >
              <div>
                <p className="font-semibold text-text">Retention Analytics</p>
                <p className="text-[11px] text-muted-text">View memory stability, heatmaps, and streak data</p>
              </div>
              <span className="text-muted-text">View -&gt;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
