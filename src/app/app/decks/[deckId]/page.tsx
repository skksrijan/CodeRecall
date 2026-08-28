'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import ProblemModal from '@/components/ProblemModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DeckProblemsPage() {
  const { deckId } = useParams();
  const { user } = useAuth();
  const [deck, setDeck] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const [token, setToken] = useState('');

  // Filters & Sorting
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTag, setFilterTag] = useState('ALL');
  const [sortField, setSortField] = useState('nextReviewDate');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    if (user && deckId) {
      user.getIdToken().then(t => {
        setToken(t);
        fetchDeckAndProblems(t, deckId as string);
      });
    }
  }, [user, deckId]);

  const fetchDeckAndProblems = async (t: string, id: string) => {
    try {
      const [deckRes, probRes] = await Promise.all([
        fetch(`/api/decks/${id}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`/api/problems?deckId=${id}`, { headers: { Authorization: `Bearer ${t}` } })
      ]);

      if (deckRes.ok) setDeck(await deckRes.json());
      if (probRes.ok) setProblems(await probRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this problem from the deck?')) return;
    
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setProblems(prev => prev.filter(p => p.id !== id));
      toast.success('Problem deleted');
    } catch (err) {
      toast.error('Error deleting problem');
    }
  };

  const handleSaved = (savedProblem: any) => {
    if (editingProblem) {
      setProblems(prev => prev.map(p => p.id === savedProblem.id ? savedProblem : p));
    } else {
      setProblems(prev => [savedProblem, ...prev]);
    }
  };

  const difficultyColors: Record<string, string> = {
    EASY: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    HARD: 'bg-rose-500/10 text-rose-500 border-rose-500/30'
  };

  const difficultyLevels: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-4 w-24 bg-surface rounded animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-surface rounded animate-pulse" />
            <div className="h-4 w-96 bg-surface rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-surface rounded animate-pulse" />
        </div>
        <div className="h-96 w-full bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-20 font-mono text-sm text-muted-text">
        Deck entry not found in active catalog.
      </div>
    );
  }

  const allTags = Array.from(new Set(problems.flatMap(p => p.tags?.map((t: any) => t.name) || [])));

  // Apply filters
  let filteredProblems = problems.filter(p => {
    if (filterDifficulty !== 'ALL' && p.difficulty !== filterDifficulty) return false;
    
    if (filterTag !== 'ALL') {
      const pTags = p.tags?.map((t: any) => t.name) || [];
      if (!pTags.includes(filterTag)) return false;
    }

    if (filterStatus !== 'ALL') {
      const today = new Date();
      const formatLocal = (d: Date) => {
        const date = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        return date.toISOString().split('T')[0];
      };
      const todayStr = formatLocal(today);
      
      const isUnreviewed = !p.reviewState || p.reviewState.repetitions === 0;
      const revDate = p.reviewState ? formatLocal(new Date(p.reviewState.nextReviewDate)) : null;

      if (filterStatus === 'UNREVIEWED') {
        if (!isUnreviewed) return false;
      } else if (filterStatus === 'NOT_SCHEDULED') {
        if (p.reviewState !== null && p.reviewState !== undefined) return false;
      } else if (filterStatus === 'OVERDUE') {
        if (isUnreviewed || !revDate || revDate >= todayStr) return false;
      } else if (filterStatus === 'DUE_TODAY') {
        if (isUnreviewed || revDate !== todayStr) return false;
      } else if (filterStatus === 'UPCOMING') {
        if (isUnreviewed || !revDate || revDate <= todayStr) return false;
      }
    }

    return true;
  });

  // Apply sorting
  filteredProblems = filteredProblems.sort((a, b) => {
    let cmp = 0;
    if (sortField === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else if (sortField === 'difficulty') {
      cmp = difficultyLevels[a.difficulty] - difficultyLevels[b.difficulty];
    } else if (sortField === 'nextReviewDate') {
      const dateA = a.reviewState?.nextReviewDate ? new Date(a.reviewState.nextReviewDate).getTime() : 0;
      const dateB = b.reviewState?.nextReviewDate ? new Date(b.reviewState.nextReviewDate).getTime() : 0;
      cmp = dateA - dateB;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/app/decks"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-text hover:text-text transition-colors"
        >
          <span>&lt;- Back to Decks Catalog</span>
        </Link>
      </div>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-text">
              [DECK INVENTORY]
            </span>
            <span className="font-mono text-xs text-muted-text">
              • {problems.length} Problems Total
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-mono">
            {deck.name}
          </h1>
          {deck.description && (
            <p className="text-xs text-muted-text mt-1 max-w-2xl leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <Link
            href={`/app/study?deckId=${deck.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-text hover:bg-background transition-colors shadow-sm uppercase tracking-wider"
          >
            Study Deck -&gt;
          </Link>
          <button
            onClick={() => { setEditingProblem(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-text text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm uppercase tracking-wider"
          >
            + Add Problem
          </button>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-surface border border-border p-3.5 rounded-xl flex flex-wrap gap-3 items-center text-xs font-mono">
        <div className="text-muted-text uppercase text-[10px] font-bold mr-1">
          [FILTERS]
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <select 
            value={filterDifficulty} 
            onChange={e => setFilterDifficulty(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium"
          >
            <option value="ALL">Difficulty: All</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1 min-w-[130px]">
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium"
          >
            <option value="ALL">Status: All</option>
            <option value="UNREVIEWED">Unreviewed (New)</option>
            <option value="DUE_TODAY">Due Today</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="NOT_SCHEDULED">Not Scheduled</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <select 
            value={filterTag} 
            onChange={e => setFilterTag(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium"
          >
            <option value="ALL">Tag: All</option>
            {allTags.map((t: unknown) => (
              <option key={t as string} value={t as string}>{t as string}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-border hidden lg:block mx-1" />

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] uppercase font-bold text-muted-text">SORT:</span>
          <select 
            value={sortField} 
            onChange={e => setSortField(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary font-medium"
          >
            <option value="nextReviewDate">Next Review Date</option>
            <option value="title">Problem Title</option>
            <option value="difficulty">Difficulty</option>
          </select>
          <button 
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs hover:bg-surface transition-colors uppercase font-bold"
            title="Toggle sort order"
          >
            {sortDir === 'asc' ? 'ASC ↑' : 'DESC ↓'}
          </button>
        </div>
      </div>

      {/* Problem Records Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-muted-text">
            No problems match the specified query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 font-mono text-[10px] uppercase tracking-wider text-muted-text">
                  <th className="py-3 px-4 font-semibold">Problem Title</th>
                  <th className="py-3 px-4 font-semibold">Difficulty</th>
                  <th className="py-3 px-4 font-semibold">Tags</th>
                  <th className="py-3 px-4 font-semibold">Next Scheduled Recall</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-mono">
                {filteredProblems.map(problem => {
                  const isUnreviewed = !problem.reviewState || problem.reviewState.repetitions === 0;
                  return (
                    <tr key={problem.id} className="hover:bg-background/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/app/study?problemId=${problem.id}`}
                            className="text-text font-semibold hover:text-primary transition-colors line-clamp-1 font-sans"
                          >
                            {problem.title}
                          </Link>
                          {isUnreviewed && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${difficultyColors[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.map((t: any) => (
                            <span key={t.id || t.name} className="bg-background border border-border text-muted-text text-[10px] px-1.5 py-0.5 rounded">
                              #{t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-text">
                        {isUnreviewed ? (
                          <span className="text-primary font-medium">[UNREVIEWED]</span>
                        ) : problem.reviewState ? (
                          new Date(problem.reviewState.nextReviewDate).toLocaleDateString()
                        ) : (
                          'Not scheduled'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[11px]">
                          <Link
                            href={`/app/study?problemId=${problem.id}`}
                            className="px-1.5 py-0.5 text-muted-text hover:text-primary hover:bg-background border border-border rounded transition-colors"
                            title="Drill Problem"
                          >
                            DRILL
                          </Link>
                          <button
                            onClick={() => { setEditingProblem(problem); setIsModalOpen(true); }}
                            className="px-1.5 py-0.5 text-muted-text hover:text-text hover:bg-background border border-border rounded transition-colors"
                            title="Edit Problem"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, problem.id)}
                            className="px-1.5 py-0.5 text-muted-text hover:text-danger hover:bg-danger/10 border border-border rounded transition-colors"
                            title="Delete Problem"
                          >
                            DEL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        existingProblem={editingProblem}
        token={token}
        deckId={deckId as string}
      />
    </div>
  );
}
