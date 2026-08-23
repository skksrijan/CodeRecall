'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface ReviewState {
  id: string;
  nextReviewDate: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Problem {
  id: string;
  title: string;
  leetcodeUrl?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  notes?: string;
  userSolution?: string;
  language?: string;
  tags: Tag[];
  reviewState: ReviewState;
}

const QUALITY_SCORES = [
  { value: 0, label: 'Blackout', description: 'Complete memory failure', color: 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50' },
  { value: 1, label: 'Wrong, familiar', description: 'Incorrect, but remembered seeing it', color: 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/50' },
  { value: 2, label: 'Wrong, easy recall', description: 'Incorrect, but easily remembered upon seeing answer', color: 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50' },
  { value: 3, label: 'Correct, hard', description: 'Correct, but took significant effort', color: 'bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-600/50' },
  { value: 4, label: 'Correct, hesitated', description: 'Correct, after some hesitation', color: 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-emerald-500/50' },
  { value: 5, label: 'Correct, instant', description: 'Correct and effortless', color: 'bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30 border-cyan-500/50' },
];

export default function StudyPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalCount, setOriginalCount] = useState(0);

  useEffect(() => {
    if (user) {
      user.getIdToken().then((t) => fetchQueue(t));
    }
  }, [user]);

  const fetchQueue = async (token: string) => {
    try {
      const res = await fetch('/api/reviews/queue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();
      setQueue(data);
      setOriginalCount(data.length);
    } catch {
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (quality: number) => {
    if (queue.length === 0 || !user) return;
    const currentProblem = queue[0];
    
    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ problemId: currentProblem.id, quality })
      });
      
      if (!res.ok) throw new Error('Failed to submit review');
      
      // Remove current problem from queue
      setQueue(prev => prev.slice(1));
      setIsRevealed(false);
      window.dispatchEvent(new Event('reviewCompleted'));
      // We don't always need a toast for every review, but it's good for feedback
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-pulse flex items-center space-x-2 text-muted-text">
          <svg className="w-5 h-5 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading study queue...</span>
        </div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success mb-4 border border-success/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">All caught up!</h1>
        <p className="text-muted-text max-w-md">
          No problems due for review right now. Take a break or add some new problems to your decks.
        </p>
        <Link href="/app/decks" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0">
          Browse Decks
        </Link>
      </div>
    );
  }

  const currentCard = queue[0];
  const currentIndex = originalCount - queue.length + 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Session</h1>
        <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
          Card {currentIndex} of {originalCount}
        </span>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-xl shadow-black/5 dark:shadow-black/40 mb-8 overflow-hidden transition-all duration-300 relative">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">{currentCard.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${
                  currentCard.difficulty === 'EASY' ? 'bg-success/10 text-success border border-success/20' :
                  currentCard.difficulty === 'MEDIUM' ? 'bg-warning/10 text-warning border border-warning/20' :
                  'bg-danger/10 text-danger border border-danger/20'
                }`}>
                  {currentCard.difficulty}
                </span>
                {currentCard.tags.map(tag => (
                  <span key={tag.id} className="bg-background text-muted-text px-2.5 py-1 rounded-md text-xs border border-border shadow-sm">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            {currentCard.leetcodeUrl && (
              <a 
                href={currentCard.leetcodeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-lg font-medium border border-primary/20 hover:bg-primary/20"
              >
                LeetCode
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {!isRevealed ? (
            <div className="mt-16 mb-6 flex justify-center">
              <button
                onClick={() => setIsRevealed(true)}
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 text-lg w-full md:w-auto"
              >
                Show Answer
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentCard.notes && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text">My Notes</h3>
                  <div className="bg-background rounded-xl p-5 text-sm whitespace-pre-wrap text-muted-text border border-border leading-relaxed shadow-inner">
                    {currentCard.notes}
                  </div>
                </div>
              )}
              
              {currentCard.userSolution && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text flex justify-between items-end">
                    Solution
                    {currentCard.language && <span className="text-xs text-muted-text font-medium bg-background px-2.5 py-1 rounded-md border border-border">{currentCard.language}</span>}
                  </h3>
                  <pre className="bg-[#1e1e1e] rounded-xl p-5 overflow-x-auto text-sm border border-border shadow-inner text-gray-300">
                    <code>{currentCard.userSolution}</code>
                  </pre>
                </div>
              )}

              <div className="pt-8 mt-8 border-t border-border">
                <h3 className="text-center font-bold mb-6 text-text">How well did you remember this?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {QUALITY_SCORES.map(score => (
                    <button
                      key={score.value}
                      onClick={() => handleGrade(score.value)}
                      disabled={isSubmitting}
                      className={`flex flex-col items-center p-4 rounded-xl border transition-all ${score.color} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0'}`}
                    >
                      <span className="font-bold text-sm md:text-base mb-1.5">{score.label}</span>
                      <span className="text-[11px] opacity-80 text-center leading-tight max-w-[140px]">{score.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
