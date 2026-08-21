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

  if (loading) return <div className="p-8 max-w-6xl mx-auto">Loading...</div>;
  if (!deck) return <div className="p-8 max-w-6xl mx-auto">Deck not found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-4 text-sm text-muted-text">
        <Link href="/app/decks" className="hover:text-primary transition">← Back to Decks</Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          {deck.description && <p className="text-muted-text mt-2">{deck.description}</p>}
        </div>
        <button
          onClick={() => { setEditingProblem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 transition"
        >
          + Add Problem
        </button>
      </div>

      <div className="bg-surface rounded-lg shadow border border-muted-text/20 overflow-hidden">
        {problems.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            No problems in this deck yet.
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
              {problems.map(problem => (
                <tr key={problem.id} className="border-b border-muted-text/20 hover:bg-muted-text/5 transition">
                  <td className="p-4">
                    {problem.leetcodeUrl ? (
                      <a href={problem.leetcodeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {problem.title}
                      </a>
                    ) : (
                      <span>{problem.title}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags?.map((t: any) => (
                        <span key={t.id} className="bg-muted-text/10 text-muted-text text-xs px-2 py-1 rounded">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-text">
                    {problem.reviewState ? new Date(problem.reviewState.nextReviewDate).toLocaleDateString() : 'Not scheduled'}
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
              ))}
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
