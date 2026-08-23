'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Flame, Calendar as CalendarIcon, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

type StatsData = {
  difficulty: { EASY: number; MEDIUM: number; HARD: number };
  upcomingLoad: { date: string; count: number }[];
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-surface rounded-lg mb-8"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-32 bg-surface rounded-2xl"></div>
          <div className="h-32 bg-surface rounded-2xl"></div>
          <div className="h-32 bg-surface rounded-2xl"></div>
          <div className="h-32 bg-surface rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-surface rounded-2xl"></div>
          <div className="h-96 bg-surface rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-danger/10 border border-danger text-danger p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <p className="font-semibold mb-2">Oops! Something went wrong.</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const difficultyData = [
    { name: 'Easy', value: data.difficulty.EASY, color: '#0ea5e9' }, // cyan-500
    { name: 'Medium', value: data.difficulty.MEDIUM, color: '#eab308' }, // yellow-500
    { name: 'Hard', value: data.difficulty.HARD, color: '#ef4444' }, // red-500
  ].filter(d => d.value > 0);

  // Heatmap Padding
  let paddedHeatmap: ({ date: string; count: number } | null)[] = [];
  if (data.heatmap.length > 0) {
    const firstDateStr = data.heatmap[0].date;
    const [year, month, day] = firstDateStr.split('-').map(Number);
    const firstDate = new Date(year, month - 1, day);
    const padding = firstDate.getDay(); // 0 is Sunday
    paddedHeatmap = [
      ...Array(padding).fill(null),
      ...data.heatmap
    ];
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-surface border border-border/50';
    if (count < 3) return 'bg-primary/30 border border-primary/20';
    if (count < 7) return 'bg-primary/60 border border-primary/40';
    return 'bg-primary border border-primary';
  };

  const formatDate = (dateStr: any) => {
    if (typeof dateStr !== 'string') return '';
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Your Dashboard
          </h1>
          <p className="text-muted-text mt-1">Track your progress and find your weak spots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Counters */}
        <div className="md:col-span-1 bg-surface border border-border rounded-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/40 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-text uppercase tracking-wider">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{data.streak.current}</span>
                <span className="text-sm font-medium text-muted-text">days</span>
              </div>
            </div>
          </div>
          
          <div className="h-px w-full bg-border" />

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-text uppercase tracking-wider">Longest Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{data.streak.longest}</span>
                <span className="text-sm font-medium text-muted-text">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Heatmap */}
        <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Review Activity (Last 90 Days)</h2>
          </div>
          
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
              {paddedHeatmap.map((day, idx) => (
                <div 
                  key={idx} 
                  title={day ? `${day.count} reviews on ${day.date}` : ''}
                  className={`w-4 h-4 rounded-sm transition-colors ${day ? getHeatmapColor(day.count) : 'bg-transparent'}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-text font-medium">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-surface border border-border/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/60 border border-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary" />
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Difficulty Donut */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/40">
          <h2 className="text-lg font-bold mb-4">Problem Difficulty</h2>
          {difficultyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} 
                    itemStyle={{ color: 'hsl(var(--text))' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {difficultyData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-sm font-medium">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-text">
              <p>No problems found.</p>
              <Link href="/app/decks" className="text-primary hover:underline mt-2">Add some problems</Link>
            </div>
          )}
        </div>

        {/* Weakness Radar */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/40 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-danger" />
            <h2 className="text-lg font-bold">Weakest Topics (Quality &lt; 5)</h2>
          </div>
          {data.weakTopics.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weakTopics} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-text))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-text))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--border))', opacity: 0.2 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} 
                  />
                  <Bar dataKey="avgQuality" name="Avg Recall Quality" radius={[0, 4, 4, 0]}>
                    {data.weakTopics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgQuality < 3 ? '#ef4444' : entry.avgQuality < 4 ? '#eab308' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-text">
              <p>Not enough review data yet.</p>
              <p className="text-sm mt-1">Keep studying to see your weak spots!</p>
            </div>
          )}
        </div>

        {/* Upcoming Load */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/40 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-bold mb-4">Upcoming Reviews (Next 7 Days)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.upcomingLoad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(var(--muted-text))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-text))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--border))', opacity: 0.2 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} 
                  labelFormatter={formatDate}
                />
                <Bar dataKey="count" name="Reviews Due" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
