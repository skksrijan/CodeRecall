'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DeckModal from '@/components/DeckModal';
import ImportModal from '@/components/ImportModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DecksPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (user) {
      user.getIdToken().then(t => {
        setToken(t);
        fetchDecks(t);
      });
    }
  }, [user]);

  const fetchDecks = async (t: string) => {
    try {
      const res = await fetch('/api/decks', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        setDecks(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this deck?')) return;
    
    try {
      const res = await fetch(`/api/decks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setDecks(prev => prev.filter(d => d.id !== id));
      toast.success('Deck deleted');
    } catch (err) {
      toast.error('Error deleting deck');
    }
  };

  const handleSaved = (savedDeck: any) => {
    if (editingDeck) {
      setDecks(prev => prev.map(d => d.id === savedDeck.id ? savedDeck : d));
    } else {
      setDecks(prev => [savedDeck, ...prev]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-text">
              [CARD CATALOG]
            </span>
            <span className="font-mono text-xs text-muted-text">
              • {decks.length} Decks Registered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-mono">
            Practice Card Decks
          </h1>
          <p className="text-xs text-muted-text mt-0.5">
            Organize algorithmic problems into structured review taxonomies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-text hover:bg-background transition-colors shadow-sm uppercase tracking-wider"
          >
            [ ↑ Import LeetCode ]
          </button>
          <button
            onClick={() => { setEditingDeck(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-text text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm uppercase tracking-wider"
          >
            + Create Deck
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface border border-border h-44 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : decks.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-surface/40 font-mono">
          <div className="font-mono text-xs text-muted-text uppercase tracking-wider mb-2">
            [EMPTY CATALOG]
          </div>
          <h3 className="text-base font-bold text-text mb-1 font-sans">No Practice Decks Yet</h3>
          <p className="text-xs text-muted-text max-w-sm mx-auto mb-6 font-sans">
            Create a custom deck or import a curated list (such as Blind 75 or NeetCode 150) to start your spaced repetition queue.
          </p>
          <div className="flex justify-center gap-3 font-mono text-xs">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-surface border border-border rounded-lg font-semibold text-text hover:bg-background transition-colors uppercase tracking-wider"
            >
              [ Import Study List ]
            </button>
            <button
              onClick={() => { setEditingDeck(null); setIsModalOpen(true); }}
              className="px-4 py-2 bg-text text-background rounded-lg font-semibold hover:opacity-90 transition-opacity uppercase tracking-wider"
            >
              + Create First Deck
            </button>
          </div>
        </div>
      ) : (
        /* Decks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/app/decks/${deck.id}`} className="group block">
              <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors h-full flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-1 font-mono">
                      {deck.name}
                    </h2>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[11px]">
                      <button
                        onClick={(e) => { e.preventDefault(); setEditingDeck(deck); setIsModalOpen(true); }}
                        className="px-1.5 py-0.5 text-muted-text hover:text-text hover:bg-background border border-border rounded transition-colors"
                        title="Edit Deck"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, deck.id)}
                        className="px-1.5 py-0.5 text-muted-text hover:text-danger hover:bg-danger/10 border border-border rounded transition-colors"
                        title="Delete Deck"
                      >
                        DEL
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">
                    {deck.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs font-mono">
                  <span className="font-bold text-text tabular-nums">
                    [{deck._count?.problems || 0} Problems]
                  </span>
                  <span className="text-[11px] text-muted-text group-hover:text-text transition-colors">
                    Open Deck -&gt;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <DeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        existingDeck={editingDeck}
        token={token}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={() => fetchDecks(token)}
        token={token}
        decks={decks}
      />
    </div>
  );
}
