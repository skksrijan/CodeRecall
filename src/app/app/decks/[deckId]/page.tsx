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
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
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
    EASY: 'bg-green-500/10 text-green-500 border-green-500/30',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    HARD: 'bg-red-500/10 text-red-500 border-red-500/30'
  };

  const difficultyLevels: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

  if (loading) return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-surface rounded"></div>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-surface rounded"></div>
          <div className="h-4 w-96 bg-surface rounded"></div>
        </div>
        <div className="h-10 w-32 bg-surface rounded"></div>
      </div>
      <div className="h-96 w-full bg-surface rounded-xl"></div>
    </div>
  );
  if (!deck) return <div className="p-8 max-w-6xl mx-auto">Deck not found</div>;

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-4 text-sm text-muted-text">
        <Link href="/app/decks" className="hover:text-primary transition">← Back to Decks</Link>
      </div>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          {deck.description && <p className="text-muted-text mt-2">{deck.description}</p>}
        </div>
        <button
          onClick={() => { setEditingProblem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors font-semibold shrink-0"
        >
          + Add Problem
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-surface border border-border p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-muted-text uppercase tracking-wider">Difficulty</label>
          <select 
            value={filterDifficulty} 
            onChange={e => setFilterDifficulty(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="ALL">All</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-muted-text uppercase tracking-wider">Status</label>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNREVIEWED">Unreviewed (New)</option>
            <option value="DUE_TODAY">Due Today</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="NOT_SCHEDULED">Not Scheduled</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
          <label className="text-xs font-semibold text-muted-text uppercase tracking-wider">Tag</label>
          <select 
            value={filterTag} 
            onChange={e => setFilterTag(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Tags</option>
            {allTags.map((t: unknown) => (
              <option key={t as string} value={t as string}>{t as string}</option>
            ))}
          </select>
        </div>

        <div className="w-px h-10 bg-border hidden lg:block mx-2" />

        <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-muted-text uppercase tracking-wider">Sort By</label>
          <div className="flex gap-2">
            <select 
              value={sortField} 
              onChange={e => setSortField(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1"
            >
              <option value="nextReviewDate">Review Date</option>
              <option value="title">Title</option>
              <option value="difficulty">Difficulty</option>
            </select>
            <button 
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="bg-background border border-border rounded-lg px-3 py-2 hover:bg-surface transition-colors"
              title="Toggle sort direction"
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-xl shadow-black/5 dark:shadow-black/40 border border-border overflow-hidden">
        {filteredProblems.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            No problems match the selected filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-muted-text/20 bg-muted-text/5">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Difficulty</th>
                <th className="p-4 font-semibold">Tags</th>
                <th className="p-4 font-semibold">Next Review</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map(problem => {
                const isUnreviewed = !problem.reviewState || problem.reviewState.repetitions === 0;
                return (
                  <tr key={problem.id} className="border-b border-border hover:bg-background/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/app/study?problemId=${problem.id}`} className="text-text font-medium hover:text-primary transition-colors">
                          {problem.title}
                        </Link>
                        {isUnreviewed && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            Unreviewed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${difficultyColors[problem.difficulty]}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags?.map((t: any) => (
                          <span key={t.id} className="bg-background border border-border text-muted-text text-xs px-2 py-0.5 rounded shadow-sm">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-text">
                      {isUnreviewed ? (
                        <span className="text-primary font-medium text-xs bg-primary/5 px-2 py-1 rounded border border-primary/10">
                          Unreviewed (New)
                        </span>
                      ) : problem.reviewState ? (
                        new Date(problem.reviewState.nextReviewDate).toLocaleDateString()
                      ) : (
                        'Not scheduled'
                      )}
                    </td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => { setEditingProblem(problem); setIsModalOpen(true); }}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, problem.id)}
                      className="text-sm text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
