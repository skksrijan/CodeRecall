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
  { value: 0, label: 'Blackout', description: 'Complete memory failure', color: 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50', key: '1' },
  { value: 1, label: 'Wrong, familiar', description: 'Incorrect, but remembered seeing it', color: 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/50', key: '2' },
  { value: 2, label: 'Wrong, easy recall', description: 'Easily remembered upon seeing answer', color: 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50', key: '3' },
  { value: 3, label: 'Hard', description: 'Correct, but took significant effort', color: 'bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-600/50', key: '4' },
  { value: 4, label: 'Good', description: 'Correct, after some hesitation', color: 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-emerald-500/50', key: '5' },
  { value: 5, label: 'Easy', description: 'Correct and effortless', color: 'bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30 border-cyan-500/50', key: '6' },
];

type TabType = 'description' | 'solution' | 'notes';

export default function StudyPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalCount, setOriginalCount] = useState(0);

  // New features state
  const [description, setDescription] = useState<string | null>(null);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [scratchpadCode, setScratchpadCode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('description');

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
      
      setQueue(prev => prev.slice(1));
      setIsRevealed(false);
      window.dispatchEvent(new Event('reviewCompleted'));
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const revealAnswer = () => {
    setIsRevealed(true);
    setActiveTab('solution');
  };

  // Stopwatch effect
  useEffect(() => {
    if (!loading && queue.length > 0 && !isRevealed) {
      const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [loading, queue, isRevealed]);

  const loadDescription = () => {
    if (queue.length === 0 || !user) return;
    setLoadingDesc(true);
    const problemId = queue[0].id;
    user.getIdToken().then(token => {
      fetch(`/api/problems/${problemId}/description`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.description && data.description !== 'No description available.') {
          setDescription(data.description);
        } else {
          setDescription(null); // Treat 'No description available' as a failure state to allow retrying
        }
      })
      .catch(() => setDescription(null))
      .finally(() => setLoadingDesc(false));
    });
  };

  // Reset state on new card & fetch description
  useEffect(() => {
    if (queue.length > 0 && user) {
      setElapsedSeconds(0);
      setDescription(null);
      setActiveTab('description');
      setScratchpadCode('');
      loadDescription();
    }
  }, [queue.length > 0 ? queue[0].id : null, user]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

      if (!isRevealed && e.ctrlKey && e.key === "'") {
        e.preventDefault();
        revealAnswer();
      } else if (isRevealed && !isSubmitting && !isInputFocused) {
        if (e.key === '1') { e.preventDefault(); handleGrade(0); }
        else if (e.key === '2') { e.preventDefault(); handleGrade(1); }
        else if (e.key === '3') { e.preventDefault(); handleGrade(2); }
        else if (e.key === '4') { e.preventDefault(); handleGrade(3); }
        else if (e.key === '5') { e.preventDefault(); handleGrade(4); }
        else if (e.key === '6') { e.preventDefault(); handleGrade(5); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isSubmitting, queue]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
  
  // Dynamic timer based on difficulty
  const getWarningThreshold = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 10 * 60; // 10 mins
      case 'MEDIUM': return 25 * 60; // 25 mins
      case 'HARD': return 45 * 60; // 45 mins
      default: return 15 * 60;
    }
  };
  const isTimerWarning = elapsedSeconds > getWarningThreshold(currentCard.difficulty);

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col">
      {/* Header Area */}
      <div className="flex justify-between items-center shrink-0 px-6 py-4">
        <h1 className="text-xl font-bold">Study Session</h1>
        <div className="flex items-center gap-4">
          <div className={`text-sm font-mono font-medium px-3 py-1.5 rounded-lg border transition-colors ${isTimerWarning ? 'bg-danger/10 text-danger border-danger/20' : 'bg-surface border-border text-muted-text'}`}>
            ⏱ {formatTime(elapsedSeconds)}
          </div>
          <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
            Card {currentIndex} of {originalCount}
          </span>
        </div>
      </div>

      {/* Split Pane Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0 px-2 pb-2">
        
        {/* LEFT PANE - Tabbed Content */}
        <div className="flex-1 bg-surface rounded-2xl border border-border shadow-xl shadow-black/5 dark:shadow-black/40 flex flex-col relative overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-border bg-surface/50 backdrop-blur-sm shrink-0">
            <button 
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'description' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-text hover:text-text hover:bg-background/50'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('solution')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'solution' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-text hover:text-text hover:bg-background/50'}`}
            >
              My Solution {isRevealed && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'notes' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-text hover:text-text hover:bg-background/50'}`}
            >
              Notes
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="animate-in fade-in duration-300 flex flex-col min-h-full">
                <div className="p-6 border-b border-border bg-background/30 shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-3">{currentCard.title}</h2>
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
                        className="text-muted-text hover:text-primary transition-colors text-sm flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg font-medium border border-border shadow-sm hover:border-primary/50"
                      >
                        LeetCode
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-6 prose prose-sm dark:prose-invert max-w-none text-muted-text">
                  {loadingDesc ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-border rounded w-3/4"></div>
                      <div className="h-4 bg-border rounded w-1/2"></div>
                      <div className="h-4 bg-border rounded w-5/6"></div>
                    </div>
                  ) : description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <p className="italic opacity-50">Description failed to load.</p>
                      <button 
                        onClick={loadDescription}
                        className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reload Description
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Solution Tab */}
            {activeTab === 'solution' && (
              <div className="p-6 animate-in fade-in duration-300">
                {!isRevealed ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-text space-y-4">
                    <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p>Solution is hidden to test your memory.</p>
                    <button 
                      onClick={revealAnswer}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Click here or press Ctrl + &apos; to reveal
                    </button>
                  </div>
                ) : (
                  <div>
                    {currentCard.userSolution ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <h3 className="text-base font-semibold text-text">Your Saved Solution</h3>
                          {currentCard.language && <span className="text-xs text-muted-text font-medium bg-background px-2.5 py-1 rounded-md border border-border">{currentCard.language}</span>}
                        </div>
                        <pre className="bg-[#1e1e1e] rounded-xl p-5 overflow-x-auto text-sm border border-border shadow-inner text-[#d4d4d4]">
                          <code>{currentCard.userSolution}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-muted-text italic">
                        No solution provided for this problem.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="p-6 animate-in fade-in duration-300">
                {currentCard.notes ? (
                  <div className="bg-background rounded-xl p-5 text-sm whitespace-pre-wrap text-muted-text border border-border leading-relaxed">
                    {currentCard.notes}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-muted-text italic">
                    No notes provided for this problem.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE - Uninterrupted Scratchpad & Grading */}
        <div className="flex-1 bg-surface rounded-2xl border border-border shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden flex flex-col relative">
          
          <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-sm shrink-0">
            <h3 className="font-semibold text-text flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Code Scratchpad
            </h3>
          </div>
          
          <div className="flex-1 p-0 relative bg-[#1e1e1e]">
            <textarea
              value={scratchpadCode}
              onChange={(e) => setScratchpadCode(e.target.value)}
              className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm p-5 resize-none focus:outline-none custom-scrollbar"
              placeholder="// Write your code or scratch notes here...&#10;// This code is strictly for your practice and will not be saved."
              spellCheck="false"
            />
          </div>
          
          {/* Bottom Action Area (Reveal or Grade) */}
          {!isRevealed ? (
            <div className="p-4 border-t border-border bg-surface/80 backdrop-blur-sm shrink-0 flex justify-end">
              <button
                onClick={revealAnswer}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 w-full flex items-center justify-center gap-2"
              >
                Reveal Answer
                <span className="opacity-60 text-sm font-normal ml-2 hidden md:inline">(Ctrl + &apos;)</span>
              </button>
            </div>
          ) : (
            <div className="p-5 border-t border-border bg-background shrink-0 animate-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-center font-bold mb-3 text-text text-sm">How well did you remember this?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {QUALITY_SCORES.map(score => (
                  <button
                    key={score.value}
                    onClick={() => handleGrade(score.value)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-all ${score.color} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs">{score.label}</span>
                      {score.key && <span className="opacity-100 text-[11px] font-bold font-mono border-2 border-current bg-background/30 rounded px-1.5 hidden md:inline">{score.key}</span>}
                    </div>
                    <span className="text-[9px] opacity-80 text-center leading-tight">{score.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
