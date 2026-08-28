'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import Link from 'next/link';

type StatsData = {
  difficulty: { EASY: number; MEDIUM: number; HARD: number };
  upcomingLoad: { date: string; count: number; reviews?: number; newCards?: number }[];
  reviewVsNew?: { reviewing: number; unreviewed: number };
  heatmap: { date: string; count: number }[];
  streak: { current: number; longest: number };
  weakTopics: { name: string; avgQuality: number; reviewCount: number }[];
};

export default function StatsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    
    user.getIdToken().then(token => {
      fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => {
        setData(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    });
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono">
        <div className="h-8 w-64 bg-surface rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-40 bg-surface rounded-xl border border-border animate-pulse" />
          <div className="h-40 bg-surface rounded-xl border border-border md:col-span-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-72 bg-surface rounded-xl border border-border animate-pulse" />
          <div className="h-72 bg-surface rounded-xl border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger/30 text-danger p-6 rounded-xl text-center font-mono text-xs">
          <p className="font-bold mb-1">Failed to load retention metrics.</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const difficultyData = [
    { name: 'Easy', value: data.difficulty.EASY, color: '#10b981' }, // emerald
    { name: 'Medium', value: data.difficulty.MEDIUM, color: '#f59e0b' }, // amber
    { name: 'Hard', value: data.difficulty.HARD, color: '#f43f5e' }, // rose
  ].filter(d => d.value > 0);

  // Heatmap Padding
  let paddedHeatmap: ({ date: string; count: number } | null)[] = [];
  if (data.heatmap.length > 0) {
    const firstDateStr = data.heatmap[0].date;
    const [year, month, day] = firstDateStr.split('-').map(Number);
    const firstDate = new Date(year, month - 1, day);
    const padding = firstDate.getDay();
    paddedHeatmap = [
      ...Array(padding).fill(null),
      ...data.heatmap
    ];
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-background border border-border/80';
    if (count < 3) return 'bg-primary/25 border border-primary/30';
    if (count < 7) return 'bg-primary/60 border border-primary/60';
    return 'bg-primary text-white border border-primary';
  };

  const formatDate = (dateStr: any) => {
    if (typeof dateStr !== 'string') return '';
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            [RETENTION TELEMETRY]
          </span>
          <span className="font-mono text-xs text-muted-text">
            • 90-Day Analytics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-mono">
          Retention &amp; Load Dashboard
        </h1>
        <p className="text-xs text-muted-text mt-0.5">
          Quantify recall efficiency, upcoming spaced review workloads, and pattern retention.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        
        {/* Streak Counters Card */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-text">
              [01] Drill Consistency
            </span>
            <div className="mt-3">
              <span className="text-xs text-muted-text uppercase">Current Streak</span>
              <div className="text-2xl font-extrabold tabular-nums text-text">
                {data.streak.current} <span className="text-xs font-normal text-muted-text">days</span>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-border">
            <span className="text-xs text-muted-text uppercase">Longest Streak</span>
            <div className="text-2xl font-extrabold tabular-nums text-text">
              {data.streak.longest} <span className="text-xs font-normal text-muted-text">days</span>
            </div>
          </div>
        </div>

        {/* 90-Day Contribution Heatmap */}
        <div className="md:col-span-2 bg-surface border border-border rounded-xl p-5 shadow-sm overflow-hidden flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-text uppercase tracking-wider">
              [02] Review Activity (Last 90 Days)
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-text">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-background border border-border" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/25 border border-primary/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/60 border border-primary/60" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary border border-primary" />
              <span>More</span>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
              {paddedHeatmap.map((day, idx) => (
                <div 
                  key={idx} 
                  title={day ? `${day.count} reviews on ${day.date}` : ''}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors ${day ? getHeatmapColor(day.count) : 'bg-transparent'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Difficulty Distribution Donut */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text uppercase tracking-wider">
              [03] Problem Distribution
            </h2>
            <span className="text-[10px] text-muted-text">TAXONOMY</span>
          </div>

          {/* Status Breakdown (Review vs New) */}
          {data.reviewVsNew && (
            <div className="p-3 bg-background border border-border rounded-lg grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-emerald-500 font-bold uppercase block">In Cycle</span>
                <span className="text-lg font-extrabold text-emerald-500 tabular-nums">{data.reviewVsNew.reviewing}</span>
              </div>
              <div>
                <span className="text-[10px] text-primary font-bold uppercase block">New Queue</span>
                <span className="text-lg font-extrabold text-primary tabular-nums">{data.reviewVsNew.unreviewed}</span>
              </div>
            </div>
          )}

          {difficultyData.length > 0 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))', 
                      backgroundColor: 'hsl(var(--surface))', 
                      color: 'hsl(var(--text))',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-2">
                {difficultyData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs font-mono font-medium">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-muted-text font-mono text-xs">
              <p>No indexed problems recorded.</p>
              <Link href="/app/decks" className="text-primary hover:underline mt-1">Browse decks -&gt;</Link>
            </div>
          )}
        </div>

        {/* Weakness Radar */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text uppercase tracking-wider">
              [04] Weakest Patterns (Avg Quality &lt; 5.0)
            </h2>
            <span className="text-[10px] text-muted-text">INFLECTION POINTS</span>
          </div>

          {data.weakTopics.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weakTopics} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-text))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-text))" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--border))', opacity: 0.2 }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))', 
                      backgroundColor: 'hsl(var(--surface))', 
                      color: 'hsl(var(--text))',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }} 
                  />
                  <Bar dataKey="avgQuality" name="Avg Recall" radius={[0, 4, 4, 0]}>
                    {data.weakTopics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgQuality < 3 ? '#f43f5e' : entry.avgQuality < 4 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-muted-text font-mono text-xs">
              <p>Insufficient telemetry data for pattern weakness radar.</p>
              <p className="text-[11px] mt-1 text-muted-text/80">Complete more daily study reviews to calibrate.</p>
            </div>
          )}
        </div>

        {/* 7-Day Upcoming Workload Projection */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm md:col-span-2 lg:col-span-3 space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-text uppercase tracking-wider">
              [05] Upcoming Spaced Repetition Workload (Next 7 Days)
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-text">Reviews Due</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-text">New Intake</span>
              </div>
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.upcomingLoad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(var(--muted-text))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-text))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--border))', opacity: 0.2 }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid hsl(var(--border))', 
                    backgroundColor: 'hsl(var(--surface))', 
                    color: 'hsl(var(--text))',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }} 
                  labelFormatter={formatDate}
                />
                <Bar dataKey="reviews" name="Reviews Due" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="newCards" name="New Problems" fill="hsl(var(--primary))" stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
