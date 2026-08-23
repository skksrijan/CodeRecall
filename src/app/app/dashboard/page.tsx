'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Library, PlayCircle, Hash, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ decks: 0, problems: 0, due: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(async (token) => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const [decksRes, queueRes] = await Promise.all([
            fetch('/api/decks', { headers }),
            fetch('/api/reviews/queue', { headers })
          ]);
          
          let decksCount = 0;
          let problemsCount = 0;
          let dueCount = 0;

          if (decksRes.ok) {
            const decksData = await decksRes.json();
            decksCount = decksData.length;
            problemsCount = decksData.reduce((acc: number, d: any) => acc + (d._count?.problems || 0), 0);
          }
          if (queueRes.ok) {
            const queueData = await queueRes.json();
            dueCount = queueData.length;
          }

          setStats({ decks: decksCount, problems: problemsCount, due: dueCount });
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      });
    }
  }, [user]);

  const firstName = (user?.displayName || user?.email || 'Student').split(' ')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {firstName}!</h1>
          <p className="text-muted-text text-lg mt-1">Ready to master your algorithms today?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Stat Card 1 */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <PlayCircle className="w-6 h-6" />
            </div>
            {stats.due > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse"></div> : stats.due}
          </h3>
          <p className="text-muted-text font-medium">Reviews Due Today</p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl w-fit mb-4">
            <Library className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse"></div> : stats.decks}
          </h3>
          <p className="text-muted-text font-medium">Total Decks</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="p-3 bg-success/10 text-success rounded-xl w-fit mb-4">
            <Hash className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? <div className="h-9 bg-background rounded w-16 animate-pulse"></div> : stats.problems}
          </h3>
          <p className="text-muted-text font-medium">Total Problems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <TrendingUp className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Jump back in!</h2>
          <p className="text-muted-text mb-8 max-w-sm">
            {stats.due > 0 
              ? `You have ${stats.due} reviews waiting for you. Consistency is key to long-term memory.`
              : `You are all caught up for today! Why not add some new problems to your decks?`}
          </p>
          <Link 
            href={stats.due > 0 ? "/app/study" : "/app/decks"} 
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            {stats.due > 0 ? "Start Studying" : "Browse Decks"}
          </Link>
        </div>
      </div>
    </div>
  );
}
