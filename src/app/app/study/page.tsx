'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })),
  { ssr: false, loading: () => <div className="w-full h-full bg-surface flex items-center justify-center text-muted-text font-mono text-xs">Loading editor environment...</div> }
);

interface ReviewState {
  id: string;
  nextReviewDate: string;
  repetitions?: number;
  interval?: number;
  easeFactor?: number;
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
  _cardType?: 'new' | 'review';
}

type TabType = 'description' | 'solution' | 'notes';

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-muted-text">Loading workbench environment...</div>}>
      <StudyContent />
    </Suspense>
  );
}

function StudyContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const manualProblemId = searchParams.get('problemId');
  const deckIdParam = searchParams.get('deckId');

  const [queue, setQueue] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSpoilerTags, setShowSpoilerTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalCount, setOriginalCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({ newCount: 0, reviewCount: 0 });
  const [showFullScaleForNew, setShowFullScaleForNew] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{ isExhausted: boolean; unstudiedCount: number; dailyLimit: number; newReviewedToday: number } | null>(null);

  // Card Content & Scratchpad State
  const [description, setDescription] = useState<string | null>(null);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [scratchpadCode, setScratchpadCode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('description');

  const [showKeepStudying, setShowKeepStudying] = useState(false);
  const [isAddingSolution, setIsAddingSolution] = useState(false);
  const [newSolutionCode, setNewSolutionCode] = useState('');
  const [globalDefaultLanguage, setGlobalDefaultLanguage] = useState('javascript');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [deckName, setDeckName] = useState<string | null>(null);

  // Theme synchronization for Monaco Editor
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const monacoTheme = mounted && resolvedTheme === 'light' ? 'light' : 'vs-dark';

  useEffect(() => {
    if (user) {
      user.getIdToken().then((t) => fetchQueue(t));
    }
  }, [user, manualProblemId, deckIdParam]);

  const fetchQueue = async (token: string) => {
    setLoading(true);
    try {
      if (deckIdParam) {
        fetch(`/api/decks/${deckIdParam}`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.name) setDeckName(d.name); })
          .catch(() => {});
      } else {
        setDeckName(null);
      }

      if (manualProblemId) {
        const res = await fetch(`/api/problems?id=${manualProblemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch problem');
        const data = await res.json();
        const problem = data.find((p: any) => p.id === manualProblemId) || data[0];
        if (problem) {
          setQueue([problem]);
          setOriginalCount(1);
        }
      } else {
        const url = deckIdParam ? `/api/reviews/queue?deckId=${deckIdParam}` : '/api/reviews/queue';
        const [queueRes, settingsRes] = await Promise.all([
          fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/user/settings', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!queueRes.ok) throw new Error('Failed to fetch queue');

        const isExhausted = queueRes.headers.get('x-quota-exhausted') === 'true';
        const unstudiedCount = Number(queueRes.headers.get('x-unstudied-count') || 0);
        const dailyLimit = Number(queueRes.headers.get('x-daily-limit') || 5);
        const newReviewedToday = Number(queueRes.headers.get('x-new-reviewed-today') || 0);
        setQuotaInfo({ isExhausted, unstudiedCount, dailyLimit, newReviewedToday });

        const data = await queueRes.json();
        setQueue(data);
        setOriginalCount(data.length);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.defaultLanguage) setGlobalDefaultLanguage(settings.defaultLanguage);
        }
      }
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
        body: JSON.stringify({
          problemId: currentProblem.id,
          quality,
        })
      });

      if (!res.ok) throw new Error('Failed to submit review');

      const isNew = currentProblem._cardType === 'new' || currentProblem.reviewState?.repetitions === 0;
      setSessionStats(prev => ({
        newCount: prev.newCount + (isNew ? 1 : 0),
        reviewCount: prev.reviewCount + (!isNew ? 1 : 0)
      }));

      // Broadcast review completion to live nav badges
      window.dispatchEvent(new CustomEvent('reviewCompleted'));

      if (manualProblemId) {
        setShowKeepStudying(true);
        setQueue([]);
        return;
      }

      setQueue((prev) => prev.slice(1));
      setIsRevealed(false);
      setShowSpoilerTags(false);
      setDescription(null);
      setElapsedSeconds(0);
      setActiveTab('description');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadDescription = useCallback(async () => {
    if (queue.length === 0 || !user) return;
    const currentProblem = queue[0];
    setLoadingDesc(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/problems/${currentProblem.id}/description`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDescription(data.description);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDesc(false);
    }
  }, [queue, user]);

  useEffect(() => {
    if (queue.length > 0) {
      loadDescription();
      const current = queue[0];
      setCurrentLanguage(current.language || globalDefaultLanguage || 'javascript');
      setScratchpadCode(`// Scratchpad for: ${current.title}\n// Write notes or test code here:\n\n`);
    }
  }, [queue.length, loadDescription, globalDefaultLanguage]);

  // Stopwatch timer
  useEffect(() => {
    if (queue.length === 0) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [queue.length]);

  const revealAnswer = () => {
    setIsRevealed(true);
    setActiveTab('solution');
  };

  // Keyboard Shortcuts: Ctrl+' to reveal, 0-5 or 1-3 to grade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.classList.contains('inputarea')
      ) {
        return;
      }

      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        revealAnswer();
        return;
      }

      if (isRevealed && !isSubmitting && queue.length > 0) {
        const currentProblem = queue[0];
        const isNewCard = currentProblem._cardType === 'new' || currentProblem.reviewState?.repetitions === 0;

        if (isNewCard && !showFullScaleForNew) {
          if (e.key === '1') handleGrade(0);
          if (e.key === '2') handleGrade(3);
          if (e.key === '3') handleGrade(5);
        } else {
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 0 && num <= 5) {
            handleGrade(num);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isSubmitting, queue, showFullScaleForNew]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Mathematical Interval Predictor Computation (SM-2 Formulation)
  const computePredictedInterval = (quality: number, currentProb: Problem) => {
    const reps = currentProb.reviewState?.repetitions || 0;
    const prevInterval = currentProb.reviewState?.interval || 1;
    const ef = currentProb.reviewState?.easeFactor || 2.5;

    if (quality < 3) {
      return '1d';
    }
    if (reps === 0) {
      return quality === 5 ? '4d' : '1d';
    }
    if (reps === 1) {
      return quality === 5 ? '10d' : '6d';
    }
    const nextInterval = Math.round(prevInterval * (ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))));
    return `${Math.max(nextInterval, prevInterval + 1)}d`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-8 text-center space-y-2">
        <div className="text-xs text-muted-text font-mono animate-pulse">Loading review session...</div>
      </div>
    );
  }

  // Session Completed State
  if (queue.length === 0) {
    const totalDone = sessionStats.reviewCount + sessionStats.newCount;
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-6 animate-in fade-in duration-300">
        <div className="p-3 bg-success/10 rounded-lg text-success border border-success/30 font-semibold text-xs font-mono">
          Session Completed
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-text">
            {deckName ? `All "${deckName}" Problems Completed!` : 'All Queued Cards Completed!'}
          </h1>
        </div>

        {totalDone > 0 ? (
          <div className="bg-surface border border-border p-6 rounded-xl max-w-md w-full shadow-sm text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-text">Cards Processed:</span>
              <span className="font-bold text-text tabular-nums">{totalDone} Total</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-text">Spaced Reviews:</span>
              <span className="font-bold text-emerald-500 tabular-nums">{sessionStats.reviewCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-text">New Intake Cards:</span>
              <span className="font-bold text-primary tabular-nums">{sessionStats.newCount}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-text max-w-md">
            {deckIdParam 
              ? 'Zero pending cards due in this deck. You can review all cards or explore other decks.'
              : 'Zero pending cards due in this queue. Take a breather or explore other practice decks.'}
          </p>
        )}

        {/* Daily Quota Notice (Global study mode only) */}
        {!deckIdParam && quotaInfo && (quotaInfo.isExhausted || (quotaInfo.unstudiedCount > 0 && sessionStats.newCount > 0) || (totalDone === 0 && quotaInfo.unstudiedCount > 0 && quotaInfo.newReviewedToday >= quotaInfo.dailyLimit)) && (
          <div className="bg-surface border border-primary/30 p-5 rounded-xl max-w-md w-full text-xs text-center space-y-2.5 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-primary font-bold">
              <span>Daily Question Limit Reached</span>
            </div>
            <p className="text-muted-text leading-relaxed font-sans">
              You have completed today&apos;s intake quota ({quotaInfo.dailyLimit} new questions/day).
              {quotaInfo.unstudiedCount > 0 && ` There are ${quotaInfo.unstudiedCount} more unstudied problem${quotaInfo.unstudiedCount === 1 ? '' : 's'} in your library.`}
            </p>
            <p className="text-muted-text leading-relaxed font-sans">
              If you want to study more problems today, you can increase your <strong className="text-text">Daily New Question Limit</strong> in Settings.
            </p>
            <div className="pt-1.5">
              <Link
                href="/app/settings"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-semibold transition-colors"
              >
                Increase Limit in Settings -&gt;
              </Link>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 text-xs uppercase tracking-wider font-semibold">
          {deckIdParam ? (
            <>
              <Link
                href={`/app/decks/${deckIdParam}`}
                className="bg-surface border border-border px-5 py-2.5 rounded-lg hover:bg-background transition-colors text-text shadow-sm"
              >
                Return to Deck -&gt;
              </Link>
              <Link
                href="/app/study"
                className="bg-text text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Daily Review Queue -&gt;
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/app/dashboard"
                className="bg-surface border border-border px-5 py-2.5 rounded-lg hover:bg-background transition-colors text-text shadow-sm"
              >
                [ Dashboard ]
              </Link>
              <Link
                href="/app/decks"
                className="bg-text text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Explore Decks -&gt;
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showKeepStudying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-5 animate-in zoom-in-95 duration-200 font-mono">
        <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 font-bold text-xs">
          [ ✓ RECALL CALIBRATED ]
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text font-sans">Problem Calibrated</h1>
          <p className="text-xs text-muted-text max-w-sm font-sans">
            Continue studying the remainder of your review queue?
          </p>
        </div>
        <div className="flex gap-3 mt-4 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => router.back()}
            className="bg-surface border border-border text-text px-5 py-2.5 rounded-lg hover:bg-background transition-colors"
          >
            [ Return to Deck ]
          </button>
          <button
            onClick={() => {
              setShowKeepStudying(false);
              router.replace('/app/study');
            }}
            className="bg-text text-background px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            Continue Queue -&gt;
          </button>
        </div>
      </div>
    );
  }

  const currentCard = queue[0];
  const currentIndex = originalCount - queue.length + 1;
  const isNewCard = currentCard._cardType === 'new' || currentCard.reviewState?.repetitions === 0;

  // Difficulty Timer Threshold
  const getWarningThreshold = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 5 * 60;
      case 'MEDIUM': return 15 * 60;
      case 'HARD': return 30 * 60;
      default: return 10 * 60;
    }
  };
  const isTimerWarning = elapsedSeconds > getWarningThreshold(currentCard.difficulty);

  const getSuggestedGrade = (difficulty: string, timeSeconds: number) => {
    const easyTarget = 2 * 60;
    const medTarget = 10 * 60;
    const hardTarget = 20 * 60;

    let target = easyTarget;
    if (difficulty === 'MEDIUM') target = medTarget;
    if (difficulty === 'HARD') target = hardTarget;

    if (timeSeconds <= target) return 5;
    if (timeSeconds <= target * 2) return 4;
    if (timeSeconds <= target * 3) return 3;
    return 2;
  };

  const suggestedGrade = getSuggestedGrade(currentCard.difficulty, elapsedSeconds);

  // Quality score configurations with calculated live predicted intervals
  const QUALITY_SCORES = [
    { value: 0, label: 'Blackout', description: 'Zero recall', color: 'border-danger/30 text-danger bg-danger/10 hover:bg-danger/20', key: '0' },
    { value: 1, label: 'Failed', description: 'Incorrect pattern', color: 'border-danger/30 text-danger bg-danger/10 hover:bg-danger/20', key: '1' },
    { value: 2, label: 'Lapsed', description: 'Struggled recall', color: 'border-warning/30 text-warning bg-warning/10 hover:bg-warning/20', key: '2' },
    { value: 3, label: 'Hard', description: 'Effortful recall', color: 'border-warning/30 text-warning bg-warning/10 hover:bg-warning/20', key: '3' },
    { value: 4, label: 'Good', description: 'Solid recall', color: 'border-success/30 text-success bg-success/10 hover:bg-success/20', key: '4' },
    { value: 5, label: 'Perfect', description: 'Instant reflex', color: 'border-success/30 text-success bg-success/10 hover:bg-success/20', key: '5' },
  ];

  const NEW_CARD_SCORES = [
    { value: 0, label: 'Brand New', description: 'Learn from scratch (Interval: 1d)', color: 'border-danger/30 text-danger bg-danger/10 hover:bg-danger/20', key: '1' },
    { value: 3, label: 'Seen, Need Practice', description: 'Re-calibrate soon (Interval: 1d)', color: 'border-warning/30 text-warning bg-warning/10 hover:bg-warning/20', key: '2' },
    { value: 5, label: 'Mastered Pattern', description: 'Fast-track to 4+ days', color: 'border-success/30 text-success bg-success/10 hover:bg-success/20', key: '3' },
  ];

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col bg-background">
      {/* Workbench Status Bar */}
      <div className="flex justify-between items-center shrink-0 px-4 sm:px-6 py-2.5 border-b border-border bg-surface text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-text">
            {deckName ? `[ DECK: ${deckName.toUpperCase()} ]` : '[ DAILY REVIEW QUEUE ]'}
          </span>
          <span className="text-muted-text hidden sm:inline">•</span>
          <span className="text-muted-text hidden sm:inline">
            CARD {currentIndex} OF {originalCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded border tabular-nums transition-colors ${isTimerWarning
              ? 'bg-danger/10 text-danger border-danger/40 font-bold animate-pulse'
              : 'bg-background border-border text-muted-text'
            }`}>
            TIMER {formatTime(elapsedSeconds)} {isTimerWarning && '[LIMIT EXCEEDED]'}
          </div>

          <div className="px-2.5 py-1 rounded bg-background border border-border text-text font-bold tabular-nums">
            {Math.round((currentIndex / originalCount) * 100)}%
          </div>
        </div>
      </div>

      {/* Split Pane Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* LEFT PANE - Tabbed Problem & Reference Code */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-surface overflow-hidden">

          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-background/50 shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-2.5 px-4 font-semibold transition-colors border-b-2 ${activeTab === 'description'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-text hover:text-text'
                }`}
            >
              [ 01 STATEMENT ]
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`flex-1 py-2.5 px-4 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${activeTab === 'solution'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-text hover:text-text'
                }`}
            >
              [ 02 SOLUTION ] {isRevealed && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2.5 px-4 font-semibold transition-colors border-b-2 ${activeTab === 'notes'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-text hover:text-text'
                }`}
            >
              [ 03 NOTES ]
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-border space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-text tracking-tight font-mono">
                      {currentCard.title}
                    </h2>
                    {currentCard.leetcodeUrl && (
                      <a
                        href={currentCard.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted-text hover:text-primary transition-colors flex items-center gap-1 bg-background px-2 py-1 rounded border border-border shrink-0 uppercase text-[11px]"
                      >
                        LEETCODE -&gt;
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${currentCard.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                        currentCard.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      }`}>
                      {currentCard.difficulty}
                    </span>

                    {isNewCard ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                        NEW CARD
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-success/10 text-success border border-success/20">
                        SPACED REVIEW
                      </span>
                    )}

                    {(isRevealed || showSpoilerTags) ? (
                      currentCard.tags?.map(tag => (
                        <span key={tag.id || tag.name} className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border text-muted-text">
                          #{tag.name}
                        </span>
                      ))
                    ) : (currentCard.tags && currentCard.tags.length > 0) ? (
                      <button
                        type="button"
                        onClick={() => setShowSpoilerTags(true)}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border/80 text-muted-text/70 hover:text-text hover:border-border transition-colors cursor-pointer"
                        title="Show algorithm topic tags as a hint"
                      >
                        [ + Hint: Tags ]
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="text-xs text-text leading-relaxed prose dark:prose-invert max-w-none">
                  {loadingDesc ? (
                    <div className="animate-pulse space-y-2 py-4">
                      <div className="h-3 bg-border rounded w-3/4" />
                      <div className="h-3 bg-border rounded w-1/2" />
                      <div className="h-3 bg-border rounded w-5/6" />
                    </div>
                  ) : description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <div className="text-center py-10 space-y-3 font-mono text-xs">
                      <p className="text-muted-text">Problem description not available locally.</p>
                      <button
                        onClick={loadDescription}
                        className="bg-surface border border-border px-3 py-1.5 rounded text-xs text-text hover:bg-background transition-colors uppercase"
                      >
                        [ Retry Description Fetch ]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Solution Tab */}
            {activeTab === 'solution' && (
              <div>
                {!isRevealed ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 font-mono">
                    <p className="text-xs text-muted-text">Reference solution and pattern tags are hidden during active recall.</p>
                    <button
                      onClick={revealAnswer}
                      className="text-xs text-primary hover:underline font-semibold uppercase"
                    >
                      [ Click to reveal or press Ctrl + &apos; ]
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Pattern Tags Revealed */}
                    {currentCard.tags && currentCard.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pb-1 font-mono text-xs">
                        <span className="text-[11px] text-muted-text uppercase font-semibold">Tags:</span>
                        {currentCard.tags.map(tag => (
                          <span key={tag.id || tag.name} className="px-2 py-0.5 rounded text-[10px] bg-background border border-border text-primary font-medium">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {currentCard.userSolution && !isAddingSolution ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-semibold text-text uppercase">[ Canonical Solution ]</span>
                          <button
                            onClick={() => {
                              setNewSolutionCode(currentCard.userSolution || '');
                              setIsAddingSolution(true);
                            }}
                            className="font-mono text-xs text-primary hover:underline uppercase"
                          >
                            [ Edit ]
                          </button>
                        </div>
                        <MarkdownRenderer
                          content={`\`\`\`${currentCard.language || 'javascript'}\n${currentCard.userSolution}\n\`\`\``}
                        />
                      </div>
                    ) : isAddingSolution ? (
                      <div className="space-y-3 font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-text uppercase">[ Edit Solution Code ]</span>
                          <select
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value)}
                            className="bg-background border border-border text-xs px-2 py-1 rounded font-mono text-text focus:outline-none focus:border-primary"
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                          </select>
                        </div>
                        <div className="w-full h-[280px] border border-border rounded-lg overflow-hidden">
                          <MonacoEditor
                            height="100%"
                            defaultLanguage={currentLanguage}
                            language={currentLanguage}
                            theme={monacoTheme}
                            value={newSolutionCode}
                            onChange={(val) => setNewSolutionCode(val || '')}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                              padding: { top: 12, bottom: 12 },
                              scrollBeyondLastLine: false,
                              tabSize: 2,
                            }}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setIsAddingSolution(false)}
                            className="px-3 py-1.5 text-xs text-muted-text hover:text-text transition-colors uppercase"
                          >
                            [ Cancel ]
                          </button>
                          <button
                            onClick={async () => {
                              if (!user) return;
                              const token = await user.getIdToken();
                              try {
                                const res = await fetch(`/api/problems/${currentCard.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ userSolution: newSolutionCode, language: currentLanguage })
                                });
                                if (res.ok) {
                                  setQueue(prev => prev.map((p, i) => i === 0 ? { ...p, userSolution: newSolutionCode, language: currentLanguage } : p));
                                  setIsAddingSolution(false);
                                  toast.success("Solution updated");
                                } else throw new Error();
                              } catch {
                                toast.error("Failed to update solution");
                              }
                            }}
                            className="bg-primary text-white px-4 py-1.5 rounded text-xs font-semibold hover:opacity-90 uppercase"
                          >
                            Save Solution
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 space-y-3 font-mono text-xs">
                        <p className="text-muted-text">No reference solution recorded for this problem yet.</p>
                        <button
                          onClick={() => {
                            setNewSolutionCode('');
                            setIsAddingSolution(true);
                          }}
                          className="bg-surface border border-border px-3.5 py-1.5 rounded text-xs font-semibold text-text hover:bg-background transition-colors uppercase"
                        >
                          + Add Canonical Solution
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4 font-mono">
                <span className="text-xs font-semibold text-text uppercase">[ Pattern Learnings ]</span>
                {currentCard.notes ? (
                  <div className="bg-background border border-border p-4 rounded-lg font-sans">
                    <MarkdownRenderer content={currentCard.notes} />
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-muted-text border border-dashed border-border rounded-lg">
                    No notes recorded for this problem.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE - Live Code Scratchpad & Calibrated Rating Scale */}
        <div className="flex-1 flex flex-col bg-[#0D1117] overflow-hidden font-mono">

          {/* Scratchpad Header */}
          <div className="px-4 py-2 border-b border-border/80 flex justify-between items-center bg-[#0D1117] shrink-0 text-xs text-muted-text">
            <span className="text-text font-semibold">[ CODE SCRATCHPAD ]</span>
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-background border border-border text-xs px-2 py-0.5 rounded font-mono text-text focus:outline-none focus:border-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          {/* Monaco Scratchpad */}
          <div className="flex-1 p-0 relative overflow-hidden">
            <MonacoEditor
              height="100%"
              defaultLanguage={currentLanguage}
              language={currentLanguage}
              theme={monacoTheme}
              value={scratchpadCode}
              onChange={(val) => setScratchpadCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Action / Rating Footer */}
          {!isRevealed ? (
            <div className="p-4 border-t border-border bg-surface shrink-0">
              <button
                onClick={revealAnswer}
                className="w-full bg-text text-background py-3 rounded-lg font-semibold text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
              >
                <span>Reveal Canonical Solution</span>
                <span className="opacity-60 text-[10px] lowercase font-normal">(ctrl + &apos;)</span>
              </button>
            </div>
          ) : isNewCard && !showFullScaleForNew ? (
            /* New Card 3-Point Initial Calibration */
            <div className="p-4 border-t border-border bg-surface shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  [ Rate Initial Familiarity ]
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullScaleForNew(true)}
                  className="text-[10px] text-muted-text hover:text-text underline uppercase"
                >
                  Use 0–5 Scale
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {NEW_CARD_SCORES.map(score => (
                  <button
                    key={score.value}
                    onClick={() => handleGrade(score.value)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${score.color} ${isSubmitting ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{score.label}</span>
                      <span className="px-1 py-0.2 rounded border border-current text-[9px]">[{score.key}]</span>
                    </div>
                    <span className="text-[10px] opacity-80 mt-0.5 leading-tight">{score.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Standard SM-2 0-5 Mathematical Interval Predictor Grading Scale */
            <div className="p-4 border-t border-border bg-surface shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  [ Self-Grade Memory Recall (SM-2) ]
                </span>
                {isNewCard && (
                  <button
                    type="button"
                    onClick={() => setShowFullScaleForNew(false)}
                    className="text-[10px] text-muted-text hover:text-text underline uppercase"
                  >
                    Use 3-point scale
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {QUALITY_SCORES.map(score => {
                  const isSuggested = score.value === suggestedGrade;
                  const predictedInterval = computePredictedInterval(score.value, currentCard);
                  return (
                    <button
                      key={score.value}
                      onClick={() => handleGrade(score.value)}
                      disabled={isSubmitting}
                      className={`flex flex-col items-center justify-between p-2 rounded-lg border transition-all relative ${score.color} ${isSubmitting ? 'opacity-50' : 'hover:scale-[1.02]'} ${isSuggested ? 'ring-2 ring-primary ring-offset-1 ring-offset-background font-bold shadow-sm' : ''}`}
                    >
                      {isSuggested && (
                        <span className="absolute -top-2 bg-primary text-white text-[8px] font-bold px-1.5 py-0.2 rounded uppercase">
                          REC
                        </span>
                      )}
                      <div className="flex items-center gap-1 font-bold text-xs">
                        <span>[{score.value}]</span>
                        <span className="text-[10px] opacity-80">{score.label}</span>
                      </div>
                      <div className="text-[9px] font-semibold mt-1 px-1.5 py-0.2 rounded bg-background/50 border border-current/30">
                        {predictedInterval}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-muted-text text-center">
                Press keys <kbd className="bg-background px-1 rounded border border-border">0</kbd>–<kbd className="bg-background px-1 rounded border border-border">5</kbd> for rapid grading.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
